const express = require('express');
const {
    updateUser,
    createUser,
    deleteUser,
    createOrganization,
    updateOrganization,
    deleteOrganization
} = require('../controllers/admin_controller');
const router = express.Router();

router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.post('/', createOrganization)
router.patch('/:id', updateOrganization)
router.delete('/:id', deleteOrganization)

module.exports = router