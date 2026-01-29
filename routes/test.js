const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ 
    message: "Test API working!", 
    currentUser: req.user,
    timestamp: new Date().toISOString(),
    status: "success"
  });
});

module.exports = router;