const express = require('express');
const { 
    getRequirements, 
    fillRequirements, 
    getHistory
} 
    = require('../controllers/organization_controller');
const router = express.Router();

router.get("/reqforms/:org_name", getRequirements);
router.get("/hisform/:org_name", getHistory);
router.put("/requirements/:requirement", fillRequirements)

module.exports = router