const express = require('express');
const {
    getRequirements,
    fillRequirements,
    getHistory
}
    = require('../controllers/organization_controller');
const { requireRole } = require('../middleware/gatekeeper');
const router = express.Router();

router.get("/reqforms/:org_name", requireRole('student organization user'), getRequirements);
router.get("/hisform/:org_name", requireRole('student organization user'), getHistory);
//
router.put("/requirements/:requirement", fillRequirements)

module.exports = router