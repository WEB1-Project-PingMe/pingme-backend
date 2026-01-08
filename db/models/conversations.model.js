const mongoose = require("mongoose");
const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    participantIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    lastMessageAt: { type: Date, index: true },
    lastMessageText: { type: String },
    type: { type: String, enum: ["direct", "group"], default: "direct" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);