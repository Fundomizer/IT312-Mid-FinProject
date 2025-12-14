const express = require('express');
const {
    updateUser,
    createUser,
    deleteUser,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getLogs,
    getUsers,
    getStudentOrgs
} = require('../controllers/admin_controller');
const router = express.Router();

router.get('/rsc/log', getLogs)
router.get('/rsc/users', getUsers)
router.get('/rsr/orgs', getStudentOrgs)
router.post('/crtuser', createUser)
router.put('/upduser/:id', updateUser)
router.delete('/deluser/:id', deleteUser)
router.post('/crtorg/', createOrganization)
router.patch('/updorg/:id', updateOrganization)
router.delete('/delorg/:id', deleteOrganization)

module.exports = router