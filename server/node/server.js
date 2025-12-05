const express = require('express');
const cors = require('cors');
const connectToDB = require('./database/connect');

const port = 8123
const app = express();

app.use(express.json());
app.set("json spaces", 4) // Pretty print 
app.use(cors())

async function startServer() {
    const db = await connectToDB()

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

    app.use('/api/users', require('./routes/admin'))

    app.listen(port, "0.0.0.0", () => {
        console.log(`Node server running on port ${port}`);
    })
}

startServer()