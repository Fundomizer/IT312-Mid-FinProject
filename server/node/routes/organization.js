const express = require('express');
const { createOrganization, updateOrganization, deleteOrganization } = require('../controllers/organization_controller');
const router = express.Router();

router.post('/', createOrganization)
router.patch('/:id', updateOrganization)
router.delete('/:id', deleteOrganization)

module.exports = router