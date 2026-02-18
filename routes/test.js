const express = require("express");
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ 
    message: "Test API working!", 
    timestamp: new Date().toISOString(),
    status: "success"
  });
});



router.get("/", verifyToken, (req, res) => {
  res.json({ 
    message: "Test Current User?", 
    currentUser: req.user,
    timestamp: new Date().toISOString(),
    status: "success"
  });
});

module.exports = router;