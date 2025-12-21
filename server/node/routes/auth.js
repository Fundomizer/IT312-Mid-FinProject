const express = require("express");
const router = express.Router();
const { login, logout, getProfile } = require("../controllers/auth_controller");

router.post('/login', login)
router.post('/logout', logout)
router.post('/profile', getProfile)

module.exports = router;
