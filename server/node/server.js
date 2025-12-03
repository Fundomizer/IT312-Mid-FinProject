const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const connection = "mongodb+srv://testuser:test321@cluster0.lbsrw5e.mongodb.net/" // TODO change this to use local later on
const port = 8123
const app = express();

app.use(express.json());
app.set("json spaces", 4) // Pretty print 
app.use((req, res, next) => { // Set Headers
    res.header("Access-Control-Allow-Origin", "*"); // allow all origins
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

const client = new MongoClient(connection);
client.connect();

const db = client.db("OrganizationManagementDatabase");
const collectionNames = ["forms", "log", "student_organization", "users"]

collectionNames.forEach(name => {
    const collection = db.collection(name)
    if (name === "users") collection.createIndex({ email: 1 }, { unique: true });
    app.get(`/api/${name}`, async (req, res) => {
        try {
            const all = await collection.find().toArray();
            res.json(all);
        } catch (e) {
            res.status(500).send({ error: e.message })
        }
    });
})

app.listen(port, "0.0.0.0", () => {
    console.log(`Node server running on port ${port}`);
})

// Handle creating new users
app.post("/api/users", async (request, response) => {
    try {
        const newUser = sanitizeObject(request.body)

        const date = new Date();
        const formattedDate = date.toISOString().split("T")[0];

        newUser.date_created = formattedDate

        const result = await db.collection("users").insertOne(newUser);
        console.log(result);

        if (result['acknowledged']) {
            response.status(201).json({ message: "User Successfully created", status: true }) // Note that true means successful
        } else {
            response.status(500).send({ message: "Could not create user", status: false }) // Note that true means successful
        }
    } catch (err) {
        if (err.code === 11000) {
            response.status(500).json({ message: "Email already used", status: false });
        } else {
            response.status(500).send({ message: "Could not create user", status: false })
        }
    }
})

// Handle updating user
app.put("/api/users/:id", async (req, res) => {
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
});


// Handle deleting
app.delete("/api/users/:id", async (req, res) => {
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
});

/**
 * Removes empty properties
 * @param {Object} obj 
 * @returns 
 */
function sanitizeObject(obj) {
    const cleaned = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed !== "") {
                cleaned[key] = trimmed;
            }
        } else if (value !== null && value !== undefined) {
            cleaned[key] = value;
        }
    }

    return cleaned;
}
