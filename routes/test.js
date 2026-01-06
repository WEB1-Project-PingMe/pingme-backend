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

router.get('/db', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        status: 'error',
        message: 'Database not connected',
        readyState: mongoose.connection.readyState // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      status: 'success',
      message: 'Database connection working!',
      timestamp: new Date().toISOString(),
      connected: true,
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: collections.map(c => c.name),
      collectionsCount: collections.length
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;