const express = require('express');
const router = express.Router();
const mongoose = require('../db/models/test.model'); // needs to be changed for deployment

router.get('/', (req, res) => {
  res.json({ 
    message: 'Test API working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

module.exports = router;