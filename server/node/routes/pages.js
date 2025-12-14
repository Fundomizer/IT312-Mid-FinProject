const express = require("express");
const path = require("path");
const router = express.Router();

const { requireRole } = require("../middleware/gatekeeper");

// These protect the pages
router.get("/", (req, res) => res.redirect(302, "/"));

router.get("/:any", (req, res, next) => {
    // If the request matches a valid subroute, skip this
    next();
});

// Admin pages
router.get("/admin/:file", requireRole("admin"), (req, res) => {
    res.sendFile(path.join(__dirname, "../../../pages/admin", req.params.file));
});

// Org pages
router.get("/org/:file", requireRole("student organization user"), (req, res) => {
    res.sendFile(path.join(__dirname, "../../../pages/org", req.params.file));
});

// OSA pages
router.get("/osa/:file", requireRole("osa"), (req, res) => {
    res.sendFile(path.join(__dirname, "../../../pages/osa", req.params.file));
});

router.get("/:any", (req, res) => {
    return res.redirect(302, "/");
});

module.exports = router;
