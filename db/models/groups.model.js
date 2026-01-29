const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    adminIds: [{ type: Schema.Types.ObjectId, ref: "User"}],
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    lastMessageAt: { type: Date, index: true },
    lastMessageText: { type: String },
    lastMessageSender: {type: Schema.Types.ObjectId, ref: "User"},
  },
  { timestamps: true }
);

groupSchema.index({ memberIds: 1, lastMessageAt: -1 });
groupSchema.index({ adminIds: 1 });
groupSchema.index({ isPrivate: 1, isActive: 1 });

groupSchema.pre('save', async function() {
  if (!this.adminIds || this.adminIds.length === 0) {
    const error = new Error('Group must have at least one admin');
    throw error;
  }
});

module.exports = mongoose.model("Group", groupSchema);