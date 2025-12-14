const { connectToDB } = require('../database/connect.js')
const { ObjectId } = require('mongodb')
const { sanitizeObject, touchSession } = require('../utilities.js')

let db;

(async () => {
    db = await connectToDB();
})();

exports.getRequirements = async (req, res) => {
    try {

        console.log(`Org ${req.params.org_name} requesting requirements`);

        const orgsForms = db.collection("forms");
        const { org_name } = req.params;

        const requirements = await orgsForms.find(
            { assigned_to: { $in: [org_name, "all"] } }
        ).toArray();

        console.log(`Requirements ${requirements}`);

        if (!requirements) {
            return res.status(404).json({
                success: false,
                message: `Unknown organization ${org_name}`
            });
        }

        touchSession(req)

        res.json({
            success: true,
            requirements: requirements
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getHistory = async (req, res) => {

    console.log(`Org ${req.params.org_name} requesting history`);

    const { org_name } = req.params
    const orgsForms = db.collection("student_organization");

    const history = await orgsForms.findOne(
        {
            $or: [
                { org_name: org_name },
                { short_name: org_name }
            ]
        },
        {
            projection: { _id: 0, requirements: 1 }
        }
    )

    if (!history) {
        return res.status(404).json({
            success: false,
            message: `Unknown organization ${org_name}`
        });
    }

    touchSession(req)
    res.json({
        success: true,
        history: history
    })

}

exports.fillRequirements = async (req, res) => {
    console.log("Filling out the requirements");

    try {
        const { org_name, requirement } = req.params;

        console.log("Received the following form: ", req.body);
        console.log("Files received:", req.files);
        console.log(`Org name ${org_name}, requirement ${requirement}`);

        if (!org_name || !requirement) {
            return res.status(400).json({
                success: false,
                message: "Missing org_name or requirement"
            });
        }

        const orgs = db.collection("student_organization");

        // 1. Load existing organization
        const org = await orgs.findOne({
            $or: [
                { org_name: org_name },
                { short_name: org_name }
            ]
        });

        if (!org) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        const internalKey = requirement
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        console.log(`Internal key "${internalKey}"`);

        // Ensure requirements object exists
        if (!org.requirements) {
            org.requirements = {};
        }

        // Get the form template from forms collection
        const formsCollection = db.collection("forms");
        const formTemplate = await formsCollection.findOne({
            requirement_name: requirement
        });

        if (!formTemplate) {
            return res.status(404).json({
                success: false,
                message: "Form template not found"
            });
        }

        // Auto-create or get existing requirement
        if (!org.requirements[internalKey]) {
            org.requirements[internalKey] = {
                form_id: formTemplate._id,
                tags: formTemplate.tags || [],
                last_updated: null,
                fields: formTemplate.fields.map(field => ({
                    question: field.question,
                    field_type: field.field_type,
                    required: field.required,
                    options: field.options || [],
                    content: ""
                }))
            };
        }

        const existingFields = org.requirements[internalKey].fields || [];

        // 2. Build fields array from form data - preserve all original field properties
        const updatedFields = existingFields.map((field, index) => {
            // Start with the original field structure from the form template
            const templateField = formTemplate.fields[index] || {};

            // Get content from request body if provided
            const content = req.body[`field_${index}`] || field.content || "";

            return {
                question: templateField.question || field.question,
                field_type: templateField.field_type || field.field_type,
                required: templateField.required !== undefined ? templateField.required : field.required,
                options: templateField.options || field.options || [],
                content: content
            };
        });

        // 3. Handle supporting documents (files at requirement level)
        let uploadedFiles = [];

        console.log("Checking for files...", req.files);

        if (req.files) {
            // Check all possible file field names
            Object.keys(req.files).forEach(fileKey => {
                console.log(`Found file field: ${fileKey}`);

                const fileOrArray = req.files[fileKey];
                const files = Array.isArray(fileOrArray) ? fileOrArray : [fileOrArray];

                files.forEach(file => {
                    // Create timestamp in YYYY-MM-DD_HH:MM format
                    const now = new Date();
                    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

                    // Get file extension
                    const fileExt = file.name.substring(file.name.lastIndexOf('.'));
                    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));

                    // Format: <YYYY-MM-DD>_<HH:MM>-<org-name>-<file name>
                    const newFileName = `${dateStr}_${timeStr}-${org_name}-${fileNameWithoutExt}${fileExt}`;
                    const savePath = `./uploads/${newFileName}`;

                    console.log(`Attempting to save file: ${file.name} as ${newFileName} to ${savePath}`);

                    file.mv(savePath, (err) => {
                        if (err) {
                            console.error("File upload error:", err);
                        } else {
                            console.log(`File saved successfully: ${savePath}`);
                        }
                    });

                    uploadedFiles.push({
                        filename: file.name,
                        saved_as: newFileName,
                        filepath: savePath,
                        mimetype: file.mimetype,
                        size: file.size,
                        uploaded_at: now.toISOString()
                    });
                });
            });
        } else {
            console.log("No files found in request");
        }

        // 4. Prepare update object
        const updateObject = {
            [`requirements.${internalKey}.fields`]: updatedFields,
            [`requirements.${internalKey}.last_updated`]: new Date().toISOString().split("T")[0],
            [`requirements.${internalKey}.tags`]: formTemplate.tags || [],
            [`requirements.${internalKey}.form_id`]: formTemplate._id
        };

        // Add files if any were uploaded
        if (uploadedFiles.length > 0) {
            // Store as arrays for multiple files
            updateObject[`requirements.${internalKey}.filenames`] = uploadedFiles.map(f => f.saved_as);
            updateObject[`requirements.${internalKey}.filepaths`] = uploadedFiles.map(f => f.filepath);
            updateObject[`requirements.${internalKey}.files`] = uploadedFiles; // Full file metadata
        }

        // 5. Update MongoDB
        await orgs.updateOne(
            {
                $or: [
                    { org_name: org_name },
                    { short_name: org_name }
                ]
            },
            {
                $set: updateObject
            }
        );

        touchSession(req);

        res.json({
            success: true,
            message: "Requirement updated successfully",
            uploaded_files: uploadedFiles.length
        });

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            success: false,
            message: `Server error: ${err.message}`
        });
    }
};