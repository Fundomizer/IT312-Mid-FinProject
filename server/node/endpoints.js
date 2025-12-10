exports.exposeEndpoints = async (db, app) => {

    exposeCollections(db, app)
    exposeOrgNames(db, app)
}

function exposeCollections(db, app) {
    // Expose collections
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
}

function exposeOrgNames(db, app) {
    // Expose specific information
    const orgs = db.collection('student_organization')
    app.get(`/api/org_names`, async (req, res) => {
        try {

            const orgNames = await orgs.find({}, { projection: { org_name: 1 } }).toArray();
            res.json(orgNames)
        } catch (e) {
            res.status(500).send({ error: e.message })
        }
    })
}