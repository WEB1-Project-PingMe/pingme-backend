const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", index: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    attachments: [
      {
        url: String,
        type: String,
      },
    ],
    deletedAt: { type: Date, default: null },
    editedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

// Compound indexes for pagination
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
