const mongoose = require("../db-connector");
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    messageContent: { type: String, required: true },
    senderID: { type: String, required: true},
    recipientID: { type: String, required: true},
    chatID: { type: String, required: true}
  },
  { timestamps: true }
);


module.exports = mongoose.model("Chat", chatSchema);