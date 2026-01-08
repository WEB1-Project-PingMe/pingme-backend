const express = require("express");
const Chat = require("../db/models/chats.model");
const router = express.Router();


// POST   /chats create new chat
router.post("/", async (req, res) => {
  try {
    const message = await Message.create({
        messageContent: req.body.messageContent,
        senderID: req.body.senderID,
        recipientID: req.body.recipientID
    });
    res.status(201).json(message);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Error" });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET    /chats list all chats
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /chats leave a chat


module.exports = router;