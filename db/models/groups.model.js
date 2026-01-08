const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    lastMessageAt: { type: Date, index: true },
    lastMessageText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);