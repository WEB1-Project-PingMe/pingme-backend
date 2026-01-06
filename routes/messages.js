const express = require('express');
const Message = require('../db/models/messages.model'); // needs to be changed for deployment
const router = express.Router();

// POST /message - create new message
router.post('/', async (req, res) => {
  try {
    const message = await Message.create({
        messageContent: req.body.messageContent,
        senderID: req.body.senderID,
        recipientID: req.body.recipientID
    });
    res.status(201).json(message);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Error' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /message - Fetch all messages !!! for now
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const messages = await Message.find({
      $or: [
        { senderID: userID },
        { recipientID: userID }
      ]
    }).sort({ createdAt: 1 }); // 1 = oldest first
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;