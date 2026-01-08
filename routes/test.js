const express = require("express");
const router = express.Router();

const mongoose = require("../db/db-connector");

router.get("/", (req, res) => {
  res.json({ 
    message: "Test API working! currentUserID", 
    currentUser: req.user,
    timestamp: new Date().toISOString(),
    status: "success"
  });
});

router.get("/db", async (req, res) => {
  try {
    /*
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    
    if (state !== 1) {
      return res.status(500).json({ 
        error: `DB not connected. State: ${states[state]}` 
      });
    }
      */

    const usersCollection = mongoose.connection.collection("users");
    const alice = await usersCollection.findOne({ name: "Alice" });
    
    if (alice) {
      res.json({ 
        success: true, 
        connected: true,
        message: "Successfully read Alice from users collection!",
        alice: alice 
      });
    } else {
      const users = await usersCollection.find({}).limit(5).toArray();
      res.json({ 
        success: true, 
        connected: true,
        message: "DB connected, users collection accessible",
        userCount: users.length,
        sampleUsers: users 
      });
    }
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;