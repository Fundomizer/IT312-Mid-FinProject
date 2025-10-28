import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("OrganizationManagementDatabase");
const orgs = db.collection("student_organization");
const users = db.collection("users");
const forms = db.collection("forms");


app.get("/api/users", async (req, res) => {
  const all = await users.find().toArray();
  res.json(all);
});

app.get("/api/student_organization", async (req, res) => {
  const all = await orgs.find({}).toArray();
  res.json(all);
});

app.get("/api/forms", async (req, res) => {
  const all = await forms.find().toArray();
  res.json(all);
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
