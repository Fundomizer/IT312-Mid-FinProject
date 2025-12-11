const express = require('express');
const { createOrganization, updateOrganization, deleteOrganization, getRequirements, fillRequirements } = require('../controllers/organization_controller');
const router = express.Router();

router.post('/', createOrganization)
router.patch('/:id', updateOrganization)
router.delete('/:id', deleteOrganization)
router.get("/requirements/:name", getRequirements);
router.put("/requirements/:requirement", fillRequirements)

module.exports = router