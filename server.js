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
const history = db.collection("history");
const org_forms = db.collection("org_forms");
const osa_submissions = db.collection("osa_submissions");
const log = db.collection("log");

// Expose endpoints
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

app.get("/api/history", async (req, res) => {
  const all = await history.find().toArray();
  res.json(all);
});

app.get("/api/org_forms", async (req, res) => {
  const all = await org_forms.find().toArray();
  res.json(all);
});

app.get("/api/osa_submissions", async (req, res) => {
  const all = await osa_submissions.find().toArray();
  res.json(all);
});

app.get("/api/log", async (req, res) => {
  const all = await log.find().toArray();
  res.json(all);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Users can be accessed at http://localhost:${PORT}/api/users`);
  console.log(`Student Organization can be accessed at http://localhost:${PORT}/api/student_organization`);
  console.log(`Forms can be accessed at http://localhost:${PORT}/api/forms`);
  console.log(`History can be accessed at http://localhost:${PORT}/api/history`);
  console.log(`Org Forms can be accessed at http://localhost:${PORT}/api/org_forms`);
  console.log(`OSA Submissions can be accessed at http://localhost:${PORT}/api/osa_submissions`);
  console.log(`Log can be accessed at http://localhost:${PORT}/api/log`);
});
