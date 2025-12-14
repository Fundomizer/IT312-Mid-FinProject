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

// Helper function to handle file uploads
async function uploadFiles(files, org_name) {
    const uploadedFiles = [];
    const uploadPromises = [];

    Object.keys(files).forEach(fileKey => {
        console.log(`Found file field: ${fileKey}`);

        const fileOrArray = files[fileKey];
        const fileList = Array.isArray(fileOrArray) ? fileOrArray : [fileOrArray];

        fileList.forEach(file => {
            // Create timestamp in YYYY-MM-DD_HH-MM format
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeStr = now.toTimeString().split(' ')[0].substring(0, 5).replace(':', '-'); // HH-MM

            // Get file extension
            const fileExt = file.name.substring(file.name.lastIndexOf('.'));
            const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));

            // Replace spaces with underscores in org_name and filename
            const sanitizedOrgName = org_name.replace(/\s+/g, '_');
            const sanitizedFileName = fileNameWithoutExt.replace(/\s+/g, '_');

            // Format: <YYYY-MM-DD>_<HH-MM>-<org-name>-<file name>
            const newFileName = `${dateStr}_${timeStr}-${sanitizedOrgName}-${sanitizedFileName}${fileExt}`;
            const savePath = `./uploads/${newFileName}`;

            console.log(`Attempting to save file: ${file.name} as ${newFileName}`);

            // Create a promise for each file upload
            const uploadPromise = new Promise((resolve, reject) => {
                file.mv(savePath, (err) => {
                    if (err) {
                        console.error("File upload error:", err);
                        reject(err);
                    } else {
                        console.log(`File saved successfully: ${savePath}`);
                        resolve({
                            filename: file.name,
                            saved_as: newFileName,
                            filepath: savePath,
                            mimetype: file.mimetype,
                            size: file.size,
                            uploaded_at: now.toISOString()
                        });
                    }
                });
            });

            uploadPromises.push(uploadPromise);
        });
    });

    // Wait for all files to upload
    try {
        const results = await Promise.all(uploadPromises);
        uploadedFiles.push(...results);
        console.log(`Successfully uploaded ${uploadedFiles.length} file(s)`);
    } catch (err) {
        console.error("Error uploading files:", err);
        throw new Error(`File upload failed: ${err.message}`);
    }

    return uploadedFiles;
}

// Main function
exports.fillRequirements = async (req, res) => {
    console.log("Filling out the requirements");

    try {
        const { org_name, requirement } = req.params;

        console.log("Received form data:", req.body);
        console.log("Files received:", req.files);
        console.log(`Org: ${org_name}, Requirement: ${requirement}`);

        if (!org_name || !requirement) {
            return res.status(400).json({
                success: false,
                message: "Missing org_name or requirement"
            });
        }

        const orgs = db.collection("student_organization");

        // 1. Find the organization
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

        // 2. Create internal key for storing in org's requirements
        const internalKey = requirement
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

        console.log(`Internal key: "${internalKey}"`);

        // Ensure requirements object exists
        if (!org.requirements) {
            org.requirements = {};
        }

        // 3. Get the form template from forms collection
        const formsCollection = db.collection("forms");
        const formTemplate = await formsCollection.findOne({
            requirement_name: requirement
        });

        if (!formTemplate) {
            console.log(`Form template not found for: ${requirement}`);
            return res.status(404).json({
                success: false,
                message: "Form template not found"
            });
        }

        console.log(`Found form template: ${formTemplate.requirement_name}`);

        // 4. Initialize requirement if it doesn't exist
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
                })),
                done: false
            };
        }

        const existingFields = org.requirements[internalKey].fields || [];

        // 5. Build updated fields array preserving structure
        const updatedFields = existingFields.map((field, index) => {
            const templateField = formTemplate.fields[index] || {};
            const content = req.body[`field_${index}`] || field.content || "";

            return {
                question: templateField.question || field.question,
                field_type: templateField.field_type || field.field_type,
                required: templateField.required !== undefined ? templateField.required : field.required,
                options: templateField.options || field.options || [],
                content: content,
                done: true
            };
        });

        // 6. Handle file uploads
        let uploadedFiles = [];

        if (req.files) {
            console.log("Processing file uploads...");
            uploadedFiles = await uploadFiles(req.files, org_name);
        } else {
            console.log("No files to upload");
        }

        // 7. Prepare update object
        const updateObject = {
            [`requirements.${internalKey}.fields`]: updatedFields,
            [`requirements.${internalKey}.last_updated`]: new Date().toISOString().split("T")[0],
            [`requirements.${internalKey}.tags`]: formTemplate.tags || [],
            [`requirements.${internalKey}.form_id`]: formTemplate._id,
            [`requirements.${internalKey}.done`]: true
        };

        // Add file metadata if files were uploaded
        if (uploadedFiles.length > 0) {
            updateObject[`requirements.${internalKey}.filenames`] = uploadedFiles.map(f => f.saved_as);
            updateObject[`requirements.${internalKey}.filepaths`] = uploadedFiles.map(f => f.filepath);
            updateObject[`requirements.${internalKey}.files`] = uploadedFiles;
        }

        // 8. Update database
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