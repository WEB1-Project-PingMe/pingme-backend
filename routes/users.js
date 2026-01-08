const express = require("express");
const User = require("../db/models/users.model");
const router = express.Router();

// GET /users show user Profile Infos
// PATCH /users Update user Profile
// PATCH /users/status update online/offline status
// GET /users/settings show user settings
// PATCH /users/settings update user settings

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("name email");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;