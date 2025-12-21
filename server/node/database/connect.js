const { MongoClient } = require('mongodb');

const url = "mongodb://localhost:27017/" // TODO change this to use local later on
const client = new MongoClient(url);

let db;
let dbName = "OrganizationManagementDatabase"

async function connectToDB() {
    if (db) return db; // reuse existing connection

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        db = client.db(dbName); // change this to your DB name
        return db;
    } catch (err) {
        console.error("Could not connect to the database: ", err);
        throw err;
    }
}

module.exports = { connectToDB, url }
