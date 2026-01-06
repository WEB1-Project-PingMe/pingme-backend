const mongoose = require('../db-connector');

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, min: 0 },
  message: String
});

module.exports = mongoose.model('Test', testSchema);