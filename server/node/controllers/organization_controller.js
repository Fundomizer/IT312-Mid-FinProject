const connectToDB = require('../database/connect.js')
const { ObjectId } = require('mongodb')
const { sanitizeObject } = require('../utilities.js')

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
            created_at: new Date()
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
}