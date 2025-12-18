const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Test API working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

module.exports = router;