const express = require("express");
const User = require("../db/models/users.model");
const router = express.Router();

// GET /users show user Profile Infos
// PATCH /users Update user Profile
// PATCH /users/status update online/offline status
// GET /users/settings show user settings
// PATCH /users/settings update user settings
// GET /users/search lookup users

router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    let user;

    const isUserId = /^[0-9a-fA-F]{24}$/.test(identifier);
    if (isUserId) {
      user = await User.findById(identifier).select("name");
    } else {
      user = await User.findOne({ tag: identifier });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    const userResponse = {
      name: user.name,
      tag: user.tag,
      userId: user._id.toString()
    };

    res.status(200).json({
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query || query.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Search must be at least 3 characters"
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { tag: { $regex: query, $options: "i" } }
      ],
      _id: { $ne: req.user?.id }
    })
      .select("name tag")
      .limit(20)
      .sort({ name: 1 });

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        tag: user.tag,
      }))
    });

  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;