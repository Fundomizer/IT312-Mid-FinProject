const { connectToDB } = require('../database/connect.js')
const { ObjectId } = require('mongodb')
const { sanitizeObject, touchSession } = require('../utilities.js')

let db;

(async () => {
    db = await connectToDB();
})();

exports.createOrganization = async (req, res) => {
    try {
        const orgs = db.collection("student_organization");

        const {
            org_name,
            short_name,
            school,
            official_email,
            org_type,
            description,
            adviser,
            officers
        } = req.body;

        // Basic validation
        if (!org_name || !short_name || !school || !official_email || !org_type) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newOrg = {
            org_name,
            short_name,
            school,
            official_email,
            org_type,
            description: description || "",
            adviser: adviser || { name: "", email: "" },
            officers: officers || [],
        };

        const result = await orgs.insertOne(newOrg);

        res.json({
            message: "Organization created successfully",
            success: true,
            org: { _id: result.insertedId, ...newOrg }
        });


    } catch (err) {
        console.error("Error creating organization:", err);
        res.status(500).json({ message: "Server error", success: false });
    }
    touchSession(req)
}

exports.updateOrganization = async (req, res) => {
    try {
        const orgs = db.collection("student_organization");
        const orgId = req.params.id;

        if (!ObjectId.isValid(orgId)) {
            return res.status(400).json({ success: false, message: "Invalid organization ID" });
        }

        const {
            org_name,
            short_name,
            school,
            official_email,
            org_type,
            description,
            adviser,
            officers
        } = req.body;

        if (!org_name || !short_name || !school || !official_email || !org_type) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!Array.isArray(officers) || officers.length !== 2) {
            return res.status(400).json({
                success: false,
                message: "Exactly 2 officers are required"
            });
        }

        const updateData = {
            org_name,
            short_name,
            school,
            official_email,
            org_type,
            description: description || "",
            adviser: {
                name: adviser?.name || "",
                email: adviser?.email || ""
            },
            officers: [
                {
                    name: officers[0]?.name || "",
                    position: officers[0]?.position || ""
                },
                {
                    name: officers[1]?.name || "",
                    position: officers[1]?.position || ""
                }
            ],
        };

        const result = await orgs.findOneAndUpdate(
            { _id: new ObjectId(orgId) },
            { $set: updateData },
            { returnDocument: "after" }
        );

        res.json({
            success: true,
            message: "Organization updated successfully",
            org: result.value
        });

    } catch (err) {
        console.error("Error updating organization:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
    touchSession(req)
};

exports.deleteOrganization = async (req, res) => {
    try {
        const orgs = db.collection("student_organization");
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid organization ID" });
        }

        const result = await orgs.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.json({
            message: "Organization deleted successfully",
            success: true
        });

    } catch (err) {
        console.error("Error deleting organization:", err);
        res.status(500).json({ message: "Server error", success: false });
    }
    touchSession(req)
};

exports.getRequirements = async (req, res) => {
    try {
        const orgs = db.collection("student_organization");
        const { name } = req.params;

        const org = await orgs.findOne(
            { org_name: name },
            { projection: { _id: 0, requirements: 1 } }
        );

        if (!org) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        res.json({
            success: true,
            requirements: org.requirements
        });

    } catch (err) {
        console.error("Error fetching requirements:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.fillRequirements = async (req, res) => {
    try {
        const orgName = req.params.orgName;
        const requirementKey = req.params.requirementKey;

        const orgs = db.collection("student_organization");

        // 1. Parse text fields
        const updatedFields = [];

        Object.keys(req.body).forEach(key => {
            if (key.startsWith("field_")) {
                const index = key.split("_")[1];
                updatedFields[index] = {
                    content: req.body[key]
                };
            }
        });

        // 2. Parse file uploads (express-fileupload)
        if (req.files) {
            Object.keys(req.files).forEach(fileKey => {
                if (fileKey.startsWith("file_")) {
                    const index = fileKey.split("_")[1];
                    const file = req.files[fileKey];

                    // Save file to /uploads
                    const savePath = `./uploads/${Date.now()}_${file.name}`;

                    file.mv(savePath, err => {
                        if (err) {
                            console.error("File upload error:", err);
                        }
                    });

                    // Store file metadata
                    updatedFields[index] = {
                        ...updatedFields[index],
                        file: {
                            filename: file.name,
                            saved_as: savePath,
                            mimetype: file.mimetype,
                            size: file.size
                        }
                    };
                }
            });
        }

        // 3. Update the requirement in MongoDB
        await orgs.updateOne(
            { org_name: orgName },
            {
                $set: {
                    [`requirements.${requirementKey}.fields`]: updatedFields,
                    [`requirements.${requirementKey}.last_updated`]: new Date().toISOString().split("T")[0]
                }
            }
        );

        res.json({
            success: true,
            message: "Requirement updated successfully"
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
