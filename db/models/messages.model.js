const mongoose = require('../db-connector');

const messageSchema = new mongoose.Schema(
  {
    messageContent: { type: String, required: true },
    senderID: { type: String, required: true},
    recipientID: { type: String, required: true},
    //chatID: { type: String, required: true}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
