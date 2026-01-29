const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
  },
  {
    timestamps: true,
  }
);

// same block only allowed once
BlockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

const Block = mongoose.model("Block", BlockSchema);

module.exports = Block;