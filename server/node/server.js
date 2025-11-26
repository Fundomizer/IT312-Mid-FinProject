const express = require('express');
const { MongoClient } = require('mongodb');

const connection = "mongodb+srv://testuser:test321@cluster0.lbsrw5e.mongodb.net/"
const port = 8123
const app = express();

app.use(express.json());
app.set("json spaces", 4) // Pretty print 
app.use((req, res, next) => { // Set Headers
    res.header("Access-Control-Allow-Origin", "*"); // allow all origins
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight requests
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