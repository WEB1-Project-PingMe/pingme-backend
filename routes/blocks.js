const express = require("express");
const router = express.Router();
const Block = require("../models/Block");

// POST /blocks – block user
router.post("/", async (req, res) => {
  try {
    const { blockedUserId } = req.body;
    const userId = req.user.userId;

    if (!blockedUserId) {
      return res.status(400).json({ message: "blockedUserId ist required" });
    }

    const block = await Block.findOneAndUpdate(
      { userId, blockedUserId },
      { userId, blockedUserId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ); 

    res.status(201).json({
      message: "user blocked",
      block,
    }); 
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ message: "user is already blocked" }); 
    }
    res.status(500).json({ message: "internal server error" });
  }
});

// GET /blocks – get blocked users
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const blocks = await Block.find({ userId }).populate("blockedUserId", "username"); 

    res.status(200).json({
      blockedUsers: blocks,
    });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
});

// DELETE /blocks/:blockedUserId – remove block
router.delete("/:blockedUserId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { blockedUserId } = req.params;

    const result = await Block.findOneAndDelete({
      userId,
      blockedUserId: blockedUserId,
    }); 

    if (!result) {
      return res.status(404).json({ message: "block not found" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
});

module.exports = router;