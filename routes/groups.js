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
    const userId = req.user.userId;
    const groups = await Group.find({ 
      memberIds: userId 
    }).lean();
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


// PATCH /groups/:groupId
router.patch("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByIdAndUpdate(
      groupId,
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

// DELETE /groups/:groupId
router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByIdAndDelete(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

// POST /groups/:groupId/members
// Body: { userId: "<UserId>" }
router.post("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const group = await Group.findById(groupId);
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

// GET /groups/:groupId/members
router.get("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
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

// DELETE /groups/:groupId/members
// Body: { userId: "<UserId>" }
router.delete("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const group = await Group.findById(groupId);
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

// GET /groups/:groupId/roles
router.get("/:groupId/roles", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
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

// PATCH /groups/:groupId/members/:userID/role
// Body: { role: "admin" | "member" }
router.patch("/:groupId/members/:userID/role", async (req, res) => {
  try {
    const { groupId, userID } = req.params;
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const group = await Group.findById(groupId);
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

// POST /groups/:groupId/messages
// Body: { senderId, text }
router.post("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { senderId, text } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const message = await Message.create({
      groupId: groupId,
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

// GET /groups/:groupId/messages?limit=50&before=messageId
router.get("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, before } = req.query;

    const query = { groupId: groupId };

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


// DELETE /groups/:groupId/messages
router.delete("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params;

    await Message.deleteMany({ groupId: groupId });

    // lastMessage* in Group zurücksetzen
    await Group.findByIdAndUpdate(groupId, {
      $set: { lastMessageAt: null, lastMessageText: null, lastMessageSender: null },
    });

    res.status(204).send();
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE /groups/:groupId/messages/:messageID
router.delete("/:groupId/messages/:messageID", async (req, res) => {
  try {
    const { groupId, messageID } = req.params;

    const msg = await Message.findOneAndDelete({
      _id: messageID,
      groupId: groupId,
    });

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    // lastMessage neu berechnen
    const last = await Message.find({ groupId: groupId })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!last.length) {
      await Group.findByIdAndUpdate(groupId, {
        $set: { lastMessageAt: null, lastMessageText: null, lastMessageSender: null },
      });
    } else {
      await Group.findByIdAndUpdate(groupId, {
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

// POST /groups/:groupId/announcements
// Body: { creatorId, title, text }
router.post("/:groupId/announcements", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { creatorId, title, text } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const ann = await Announcement.create({
      groupId: groupId,
      creatorId,
      title,
      text,
    });

    res.status(201).json(ann);
  } catch (err) {
    handleError(res, err);
  }
});

// GET /groups/:groupId/announcements
router.get("/:groupId/announcements", async (req, res) => {
  try {
    const { groupId } = req.params;
    const anns = await Announcement.find({ groupId: groupId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(anns);
  } catch (err) {
    handleError(res, err, 500);
  }
});

// PATCH /groups/:groupId/announcements/:announcementID
// Body: { title?, text? }
router.patch("/:groupId/announcements/:announcementID",
  async (req, res) => {
    try {
      const { groupId, announcementID } = req.params;

      const ann = await Announcement.findOneAndUpdate(
        { _id: announcementID, groupId: groupId },
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

// DELETE /groups/:groupId/announcements/:announcementID
router.delete(
  "/:groupId/announcements/:announcementID",
  async (req, res) => {
    try {
      const { groupId, announcementID } = req.params;

      const ann = await Announcement.findOneAndDelete({
        _id: announcementID,
        groupId: groupId,
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
