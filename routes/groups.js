const express = require("express");
const Message = require("../db/models/messages.model");
const Group = require("../db/models/groups.model");
const router = express.Router({ mergeParams: true });



// GET /groups/:groupId/messages?before=ISO&limit=20
router.get("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { before, limit = 20 } = req.query;

    const query = { groupId };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /groups/:groupId/messages
// body: { senderId, text }
router.post("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, text } = req.body;

    if (!senderId || !text) {
      return res.status(400).json({ error: "senderId and text required" });
    }

    const message = await Message.create({
      groupId,
      senderId,
      text,
    });

    await Group.findByIdAndUpdate(groupId, {
      $set: {
        lastMessageAt: message.createdAt,
        lastMessageText: message.text,
      },
    });

    return res.status(201).json({ message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;
