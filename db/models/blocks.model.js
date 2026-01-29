const mongoose = require("mongoose");
const { Schema } = mongoose;

const BlockSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedUserId: {
      type: Schema.Types.ObjectId,
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

module.exports = mongoose.model("Block", BlockSchema);
