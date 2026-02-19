const express = require("express");
const Message = require("../db/models/messages.model");
const Announcement = require("../db/models/announcements.model")
const Group = require("../db/models/groups.model");
const pusher = require("../config/pusher");
const router = express.Router({ mergeParams: true });

const handleError = (res, err, status = 400) => {
  console.error(err);
  res.status(status).json({ error: err.message || "Unknown error" });
};

// POST /groups
router.post("/", async (req, res) => {
  try {
    const { name, adminIds = [], memberIds = [] } = req.body;

    const group = new Group({
      name,
      adminIds,
      memberIds,
    });

    pusher.trigger(`chat`, "new-chat", {
      message: {
        chatId: group._id,
        type: "group"
      }
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    handleError(res, err);
  }
});

// GET /groups
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().lean();
    res.json(groups);
  } catch (err) {
    handleError(res, err, 500);
  }
});

// GET /groups/:groupId
router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId).lean();

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    handleError(res, err, 500);
  }
});


// PATCH /groups/:groupID
router.patch("/:groupID", async (req, res) => {
  try {
    const { groupID } = req.params;

    const group = await Group.findByIdAndUpdate(
      groupID,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group);
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /groups/:groupID
router.delete("/:groupID", async (req, res) => {
  try {
    const { groupID } = req.params;
    const group = await Group.findByIdAndDelete(groupID);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

// POST /groups/:groupID/members
// Body: { userId: "<UserId>" }
router.post("/:groupID/members", async (req, res) => {
  try {
    const { groupID } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const group = await Group.findById(groupID);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.memberIds.includes(userId)) {
      group.memberIds.push(userId);
    }

    await group.save();
    res.status(200).json(group);
  } catch (err) {
    handleError(res, err);
  }
});

// GET /groups/:groupID/members
router.get("/:groupID/members", async (req, res) => {
  try {
    const { groupID } = req.params;

    const group = await Group.findById(groupID)
      .populate("memberIds", "_id name")
      .populate("adminIds", "_id name");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({
      members: group.memberIds,
      admins: group.adminIds,
    });
  } catch (err) {
    handleError(res, err, 500);
  }
});

// DELETE /groups/:groupID/members
// Body: { userId: "<UserId>" }
router.delete("/:groupID/members", async (req, res) => {
  try {
    const { groupID } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const group = await Group.findById(groupID);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // User aus memberIds entfernen
    group.memberIds = group.memberIds.filter(
      (id) => id.toString() !== userId
    );

    // User als Admin entfernen
    group.adminIds = group.adminIds.filter(
      (id) => id.toString() !== userId
    );

    if (group.adminIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Group must have at least one admin" });
    }

    await group.save();
    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

// GET /groups/:groupID/roles
router.get("/:groupID/roles", async (req, res) => {
  try {
    const { groupID } = req.params;

    const group = await Group.findById(groupID)
      .populate("memberIds", "_id name")
      .populate("adminIds", "_id name");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // einfache Rollenstruktur
    const roles = group.memberIds.map((member) => ({
      userId: member._id,
      role: group.adminIds
        .map((a) => a._id.toString())
        .includes(member._id.toString())
        ? "admin"
        : "member",
    }));

    res.json({ groupId: group._id, roles });
  } catch (err) {
    handleError(res, err, 500);
  }
});

// PATCH /groups/:groupID/members/:userID/role
// Body: { role: "admin" | "member" }
router.patch("/:groupID/members/:userID/role", async (req, res) => {
  try {
    const { groupID, userID } = req.params;
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const group = await Group.findById(groupID);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // User muss Mitglied sein
    if (!group.memberIds.some((id) => id.toString() === userID)) {
      return res.status(400).json({ error: "User is not a member" });
    }

    const isAdmin = group.adminIds.some(
      (id) => id.toString() === userID
    );

    if (role === "admin" && !isAdmin) {
      group.adminIds.push(userID);
    }

    if (role === "member" && isAdmin) {
      group.adminIds = group.adminIds.filter(
        (id) => id.toString() !== userID
      );
      if (group.adminIds.length === 0) {
        return res
          .status(400)
          .json({ error: "Group must have at least one admin" });
      }
    }

    await group.save();
    res.json(group);
  } catch (err) {
    handleError(res, err);
  }
});

// POST /groups/:groupID/messages
// Body: { senderId, text }
router.post("/:groupID/messages", async (req, res) => {
  try {
    const { groupID } = req.params;
    const { senderId, text } = req.body;

    const group = await Group.findById(groupID);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const message = await Message.create({
      groupId: groupID,
      senderId,
      text,
    });

    // Group-LastMessage aktualisieren
    group.lastMessageAt = message.createdAt;
    group.lastMessageText = message.text;
    group.lastMessageSender = senderId;
    await group.save();

    await pusher.trigger(`chat-${groupId}`, "new-message", {
      message: {
        _id: message._id,
        chatId: message.groupId,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt
      }
    });

    res.status(201).json(message);
  } catch (err) {
    handleError(res, err);
  }
});

// GET /groups/:groupID/messages?limit=50&before=messageId
router.get("/:groupID/messages", async (req, res) => {
  try {
    const { groupID } = req.params;
    const { limit = 50, before } = req.query;

    const query = { groupId: groupID };

    // Filter messages before the specified message ID for pagination
    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Reverse for ascending chronological order (oldest first)
    messages.reverse();

    res.json(messages);
  } catch (err) {
    handleError(res, err, 500);
  }
});


// DELETE /groups/:groupID/messages
router.delete("/:groupID/messages", async (req, res) => {
  try {
    const { groupID } = req.params;

    await Message.deleteMany({ groupId: groupID });

    // lastMessage* in Group zurücksetzen
    await Group.findByIdAndUpdate(groupID, {
      $set: { lastMessageAt: null, lastMessageText: null, lastMessageSender: null },
    });

    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /groups/:groupID/messages/:messageID
router.delete("/:groupID/messages/:messageID", async (req, res) => {
  try {
    const { groupID, messageID } = req.params;

    const msg = await Message.findOneAndDelete({
      _id: messageID,
      groupId: groupID,
    });

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    // lastMessage neu berechnen
    const last = await Message.find({ groupId: groupID })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!last.length) {
      await Group.findByIdAndUpdate(groupID, {
        $set: { lastMessageAt: null, lastMessageText: null, lastMessageSender: null },
      });
    } else {
      await Group.findByIdAndUpdate(groupID, {
        $set: {
          lastMessageAt: last[0].createdAt,
          lastMessageText: last[0].text,
          lastMessageSender: last[0].senderId,
        },
      });
    }

    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

// POST /groups/:groupID/announcements
// Body: { creatorId, title, text }
router.post("/:groupID/announcements", async (req, res) => {
  try {
    const { groupID } = req.params;
    const { creatorId, title, text } = req.body;

    const group = await Group.findById(groupID);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const ann = await Announcement.create({
      groupId: groupID,
      creatorId,
      title,
      text,
    });

    res.status(201).json(ann);
  } catch (err) {
    handleError(res, err);
  }
});

// GET /groups/:groupID/announcements
router.get("/:groupID/announcements", async (req, res) => {
  try {
    const { groupID } = req.params;
    const anns = await Announcement.find({ groupId: groupID })
      .sort({ createdAt: -1 })
      .lean();

    res.json(anns);
  } catch (err) {
    handleError(res, err, 500);
  }
});

// PATCH /groups/:groupID/announcements/:announcementID
// Body: { title?, text? }
router.patch("/:groupID/announcements/:announcementID",
  async (req, res) => {
    try {
      const { groupID, announcementID } = req.params;

      const ann = await Announcement.findOneAndUpdate(
        { _id: announcementID, groupId: groupID },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!ann) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      res.json(ann);
    } catch (err) {
      handleError(res, err);
    }
  }
);

// DELETE /groups/:groupID/announcements/:announcementID
router.delete(
  "/:groupID/announcements/:announcementID",
  async (req, res) => {
    try {
      const { groupID, announcementID } = req.params;

      const ann = await Announcement.findOneAndDelete({
        _id: announcementID,
        groupId: groupID,
      });

      if (!ann) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      res.status(204).send();
    } catch (err) {
      handleError(res, err);
    }
  }
);

module.exports = router;
