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
router.post('/user/crt/', requireRole("admin"), createUser)
router.put('/user/upd/:id', requireRole("admin"), updateUser)
router.delete('/user/del/:id', requireRole("admin"), deleteUser)
router.post('/org/crt/', requireRole("admin"), createOrganization)
router.patch('/org/upd/:id', requireRole("admin"), updateOrganization)
router.delete('/org/del/:id', requireRole("admin"), deleteOrganization)

module.exports = router