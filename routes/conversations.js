const express = require("express");
const Conversation = require("../db/models/conversations.model");
const Message = require("../db/models/messages.model");
const router = express.Router();

// GET /conversations list all chats of a user
// DELETE /conversations user leaves a chat
// GET /conversations/messages get messages from a chat
// POST /conversations/messages send message to a chat
// DELETE /conversations/messages delete message

// POST /conversations - Create new conversation
router.post('/', async (req, res) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return res.status(400).json({ error: 'participantIds array with 2+ users required' });
    }

    const conversation = await Conversation.create({
      participantIds,
    });

    await conversation.populate('participantIds', 'name');

    return res.status(201).json({ 
      conversationId: conversation._id,
      conversation 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// GET /conversations/messages?conversationId=...&before=ISO&limit=20
router.get("/messages", async (req, res) => {
  try {
    const { conversationId, before, limit = 20 } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const query = { conversationId };

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

// POST /conversations/messages
// body: { conversationId, senderId, text }
router.post("/messages", async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;

    if (!conversationId || !senderId || !text) {
      return res.status(400).json({ error: "conversationId, senderId, text required" });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
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