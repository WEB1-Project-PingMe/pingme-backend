const mongoose = require("../db-connector");

const messageSchema = new mongoose.Schema(
  {
    messageContent: { type: String, required: true },
    senderID: { type: String, required: true},
    recipientID: { type: String, required: true},
    chatID: { type: String, required: true}
  },
  { timestamps: true }
);

const decryptedMessageSchema = new mongoose.Schema(
  {
    ciphertext: { type: Buffer, required: true },  // Base64-decoded encrypted message
    iv: { type: Buffer, required: true },          // 12-byte initialization vector
    ephemPublicKey: { type: Buffer },             // Optional ephemeral key for forward secrecy
    senderID: { type: String, required: true },
    recipientID: { type: String, required: true },
    chatID: { type: String, required: true }       // Uncomment for group/1:1 chat routing
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
