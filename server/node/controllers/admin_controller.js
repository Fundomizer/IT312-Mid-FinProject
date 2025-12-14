const { connectToDB } = require('../database/connect.js')
const { ObjectId } = require('mongodb')
const { sanitizeObject, touchSession } = require('../utilities.js')

let db;

(async () => {
    db = await connectToDB();
})();

exports.getUsers = async (req, res) => {
    try {
        const users = db.collection("users");
        const data = await users.find().toArray();

        res.json({ success: true, users: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

exports.getStudentOrgs = async (req, res) => {
    try {
        const orgs = db.collection("student_organization");
        const data = await orgs.find().toArray();

        res.json({ success: true, organizations: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = db.collection("log");
        const data = await logs.find().toArray();

        res.json({ success: true, logs: data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createUser = async (req, res) => {

    try {
        const newUser = sanitizeObject(req.body);

        // Add date
        newUser.date_created = new Date().toISOString().split("T")[0];

        const result = await db.collection("users").insertOne(newUser);

        if (result.acknowledged) {
            return res.status(201).json({ message: "User successfully created", status: true });
        }

        res.status(500).json({ message: "Could not create user", status: false });


    } catch (err) {
        if (err.code === 11000) {
            return res
                .status(400)
                .json({ message: "Email already used", status: false });
        }

        console.error(err);
        res
            .status(500)
            .json({ message: "Server error", status: false });
    }
    touchSession(req)
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = sanitizeObject(req.body);

        // Find the current user document
        const currentUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found", status: false });
        }

        if (updatedData.email && updatedData.email !== currentUser.email) {
            const existing = await db.collection("users").findOne({
                email: updatedData.email,
                _id: { $ne: new ObjectId(userId) }
            });
            if (existing) {
                return res.status(400).json({ message: "Email already in use", status: false });
            }
        }

        const hasChanges = Object.keys(updatedData).some(key => {
            return updatedData[key] !== currentUser[key];
        });

        if (!hasChanges) {
            return res.status(200).json({ message: "No changes saved", status: false });
        }

        updatedData.last_updated = new Date().toISOString().split("T")[0];

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: updatedData }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "User updated successfully", status: true });
        } else {
            res.status(500).json({ message: "Update failed", status: false });
        }


    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            res.status(400).json({ message: "Email already used", status: false });
        } else {
            res.status(500).json({ message: "Error updating user", status: false });
        }
    }
    touchSession(req)
}

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const result = await db.collection("users").deleteOne({
            _id: new ObjectId(userId)
        });

        if (result.deletedCount > 0) {
            res.json({ message: "User deleted successfully", status: true });
        } else {
            res.status(404).json({ message: "User not found", status: false });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting user", status: false });
    }
    touchSession(req)
}

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