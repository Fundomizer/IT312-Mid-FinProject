const express = require('express');
const {
    getRequirements,
    fillRequirements,
    getHistory
}
    = require('../controllers/organization_controller');
const { requireRole } = require('../middleware/gatekeeper');
const router = express.Router();

router.get("/rsc/forms/:org_name", requireRole('student organization user'), getRequirements);
router.get("/rsc/history/:org_name", requireRole('student organization user'), getHistory);
//
router.put("/requirements/:requirement", requireRole('student organization user'), fillRequirements)

module.exports = router