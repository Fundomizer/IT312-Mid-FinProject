const express = require('express');
const { createOrganization, updateOrganization, deleteOrganization, getRequirements } = require('../controllers/organization_controller');
const router = express.Router();

router.post('/', createOrganization)
router.patch('/:id', updateOrganization)
router.delete('/:id', deleteOrganization)
router.get("/requirements/:name", getRequirements);

module.exports = router