const mongoose = require("../db-connector");
const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);