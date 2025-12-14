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

    res.json({
        success: true,
        history: history
    })

}

exports.fillRequirements = async (req, res) => {
    console.log("Filling out the requirements");

    try {
        const orgName = req.body.org_name;          // from FormData
        const requirementKey = req.params.requirement; // you said it's now in body

        console.log("Received: ", req.body);

        if (!orgName || !requirementKey) {
            return res.status(400).json({
                success: false,
                message: "Missing org_name or requirement"
            });
        }

        const orgs = db.collection("student_organization");

        // 1. Load existing organization and requirement
        const org = await orgs.findOne({ org_name: orgName });

        if (!org || !org.requirements || !org.requirements[requirementKey]) {
            return res.status(404).json({
                success: false,
                message: "Organization or requirement not found"
            });
        }

        const existingFields = org.requirements[requirementKey].fields || [];

        // 2. Build partial updates by index from body + files
        const updatedFields = []; // holds only changes

        // 2a. Text content (field_0, field_1, ...)
        Object.keys(req.body).forEach(key => {
            if (key.startsWith("field_")) {
                const index = Number(key.split("_")[1]);
                if (!updatedFields[index]) updatedFields[index] = {};

                // ✅ Add/replace only "content"
                updatedFields[index].content = req.body[key];
            }
        });

        // 2b. Files (file_0, file_1, ...)
        if (req.files) {
            Object.keys(req.files).forEach(fileKey => {
                if (fileKey.startsWith("file_")) {
                    const index = Number(fileKey.split("_")[1]);
                    const file = req.files[fileKey];

                    const savePath = `./uploads/${Date.now()}_${file.name}`;

                    file.mv(savePath, err => {
                        if (err) {
                            console.error("File upload error:", err);
                        }
                    });

                    if (!updatedFields[index]) updatedFields[index] = {};

                    // ✅ Add/replace only "file"
                    updatedFields[index].file = {
                        filename: file.name,
                        saved_as: savePath,
                        mimetype: file.mimetype,
                        size: file.size
                    };
                }
            });
        }

        // 3. Merge updates into existing fields
        const mergedFields = existingFields.map((field, index) => {
            const updates = updatedFields[index] || {};
            return {
                ...field,   // keep question, field_type, required, tags, etc.
                ...updates  // apply new content and/or file
            };
        });

        // 4. Save merged fields back to MongoDB
        await orgs.updateOne(
            { org_name: orgName },
            {
                $set: {
                    [`requirements.${requirementKey}.fields`]: mergedFields,
                    [`requirements.${requirementKey}.last_updated`]:
                        new Date().toISOString().split("T")[0]
                }
            }
        );

        res.json({
            success: true,
            message: "Requirement updated successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
