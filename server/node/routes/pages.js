const express = require("express");
const path = require("path");
const router = express.Router();

const { requireRole } = require("../middleware/gatekeeper");

router.use((req, res, next) => {
    // Check if trying to access .js, .json, controller files, etc.
    const blockedExtensions = ['.js', '.json', '.env', '.config'];
    const ext = path.extname(req.path);

    if (blockedExtensions.includes(ext) && !req.path.endsWith('.html')) {
        return res.status(403).send('Forbidden');
    }
    next();
});

router.get("/admin/:file", requireRole("admin"), (req, res) => {
    const file = req.params.file;

    // Only allow .html files
    if (!file.endsWith('.html')) {
        return res.status(403).send('Forbidden');
    }

    res.sendFile(path.join(__dirname, "../../../pages/admin", file));
});

router.get("/org/:file", requireRole("student organization user"), (req, res) => {
    const file = req.params.file;

    if (!file.endsWith('.html')) {
        return res.status(403).send('Forbidden');
    }

    res.sendFile(path.join(__dirname, "../../../pages/org", file));
});

router.get("/osa/:file", requireRole("osa"), (req, res) => {
    const file = req.params.file;

    if (!file.endsWith('.html')) {
        return res.status(403).send('Forbidden');
    }

    res.sendFile(path.join(__dirname, "../../../pages/osa", file));
});

router.get("/:any", (req, res) => {
    return res.redirect('/');
});

module.exports = router;