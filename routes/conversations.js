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
router.post("/", async (req, res) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return res.status(400).json({ error: "participantIds array with 2+ users required" });
    }

    const conversation = await Conversation.create({
      participantIds,
    });

    await conversation.populate("participantIds", "name");

    return res.status(201).json({ 
      conversationId: conversation._id,
      conversation // TODO: res.Message und nur id zurückgeben
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation
      .find({ participantIds: userId })
      .populate("participantIds", "email")
      .sort({ lastMessageAt: -1 })
      .lean();

    // Transform data to group participants and identify other participant
    const formattedConversations = conversations.map(conv => {
      const otherParticipants = conv.participantIds.filter(p => 
        p._id.toString() !== userId
      );
      // TODO: vielleicht doch beide returnen
      return {
        _id: conv._id,
        type: conv.type,
        participants: otherParticipants,
        lastMessageAt: conv.lastMessageAt,
        lastMessageText: conv.lastMessageText,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message
    });
  }
});

// GET /conversations/messages?conversationId=...&before=ISO&limit=20
router.get("/messages", async (req, res) => {
  try {
    const { conversationId, before, limit = 20 } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const query = { 
      conversationId,
      deletedAt: null  // Filter out deleted messages
    };

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


router.delete("/messages", async (req, res) => {
  try {
    const { conversationId, messageId } = req.body;
    const userId = req.user.id;

    if (!messageId || !conversationId) {
      return res.status(400).json({ error: "messageId and conversationId are required" });
    }

    // Verify message exists, belongs to conversation, owned by user, not deleted
    const message = await Message.findOne({ 
      _id: messageId, 
      conversationId,
      senderId: userId,
      deletedAt: null 
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found, already deleted, wrong conversation, or you don't own it" });
    }

    // Soft delete
    await Message.updateOne(
      { _id: messageId },
      { deletedAt: new Date() }
    );

    res.json({ 
      success: true, 
      message: "Message deleted successfully" 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;