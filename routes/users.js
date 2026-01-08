const express = require("express");
const User = require("../db/models/users.model");
const router = express.Router();

// GET /users show user Profile Infos
// PATCH /users Update user Profile
// PATCH /users/status update online/offline status
// GET /users/settings show user settings
// PATCH /users/settings update user settings


module.exports = router;