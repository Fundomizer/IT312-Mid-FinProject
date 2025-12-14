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

        // Auto-create requirement if missing
        if (!org.requirements[internalKey]) {
            org.requirements[internalKey] = {
                form_id: null,
                tags: [],
                last_updated: null,
                fields: []
            };
        }

        const existingFields = org.requirements[internalKey].fields || [];

        // 2. Build fields array from form data
        const updatedFields = [];

        // Process text content (field_0, field_1, ...)
        Object.keys(req.body).forEach(key => {
            if (key.startsWith("field_")) {
                const index = Number(key.split("_")[1]);

                // Preserve existing field structure or create new
                updatedFields[index] = {
                    ...(existingFields[index] || {}),
                    content: req.body[key]
                };
            }
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
                    const savePath = `./uploads/${Date.now()}_${file.name}`;

                    console.log(`Attempting to save file: ${file.name} to ${savePath}`);

                    file.mv(savePath, (err) => {
                        if (err) {
                            console.error("File upload error:", err);
                        } else {
                            console.log(`File saved successfully: ${savePath}`);
                        }
                    });

                    uploadedFiles.push({
                        filename: file.name,
                        saved_as: savePath,
                        mimetype: file.mimetype,
                        size: file.size
                    });
                });
            });
        } else {
            console.log("No files found in request");
        }

        // 4. Prepare update object
        const updateObject = {
            [`requirements.${internalKey}.fields`]: updatedFields,
            [`requirements.${internalKey}.last_updated`]: new Date().toISOString().split("T")[0]
        };

        // Add files if any were uploaded
        if (uploadedFiles.length > 0) {
            // If you want a single file (like your example):
            updateObject[`requirements.${internalKey}.filename`] = uploadedFiles[0].filename;
            updateObject[`requirements.${internalKey}.file_path`] = uploadedFiles[0].saved_as;

            // Or if you want multiple files:
            // updateObject[`requirements.${internalKey}.files`] = uploadedFiles;
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