const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    adminIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true}],
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    lastMessageAt: { type: Date, index: true },
    lastMessageText: { type: String },
    lastMessageSender: {type: Schema.Types.ObjectId, ref: "User"},
  },
  { timestamps: true }
);

groupSchema.index({ memberIds: 1, lastMessageAt: -1 });
groupSchema.index({ "adminIds": 1 });
groupSchema.index({ isPrivate: 1, isActive: 1 });

// Validate at least one admin
groupSchema.pre('save', function(next) {
  if (this.adminIds && this.adminIds.length === 0) {
    return next(new Error('Group must have at least one admin'));
  }
  next();
});

module.exports = mongoose.model("Group", groupSchema);