const { connectToDB } = require('../database/connect.js')
const { ObjectId } = require('mongodb')
const { sanitizeObject, touchSession } = require('../utilities.js')

let db;

(async () => {
    db = await connectToDB();
})();

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
