const mongoose = require("../db-connector");
const { Schema } = mongoose;

const testSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, min: 0 },
  message: String
});

module.exports = mongoose.model("Test", testSchema);
