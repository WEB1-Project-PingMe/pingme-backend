const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
  username: { 
    type: String, 
    required: true,
    trim: true 
  },
  contactName: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true 
  },
  contactUserId: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true 
  }
}, { 
  timestamps: true 
});


module.exports = mongoose.model("Contact", contactSchema);
