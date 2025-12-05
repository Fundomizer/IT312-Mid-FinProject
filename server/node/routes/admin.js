const express = require('express');
const { updateUser, createUser, deleteUser } = require('../controllers/admin_controller');
const router = express.Router();


router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

module.exports = router