const express = require('express');
const { createOrganization } = require('../controllers/organization_controller');
const router = express.Router();

router.post('/', createOrganization)

module.exports = router