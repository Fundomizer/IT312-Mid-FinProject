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
const { requireRole } = require('../middleware/gatekeeper')

const router = express.Router();

router.get('/rsc/log', requireRole("admin"), getLogs)
router.get('/rsc/users', requireRole("admin"), getUsers)
router.get('/rsc/orgs', requireRole("admin"), getStudentOrgs)
//
router.post('/user/crt/', createUser)
router.put('/user/upd/:id', updateUser)
router.delete('/user/del/:id', deleteUser)
router.post('/org/crt/', createOrganization)
router.patch('/org/upd/:id', updateOrganization)
router.delete('/org/del/:id', deleteOrganization)

module.exports = router