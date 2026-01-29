const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../db/models/users.model");
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Create User
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const { password: _, ...userResponse } = user.toObject();
    
    res.status(201).json({ 
      message: "User created successfully",
      user: userResponse 
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.name) {
        return res.status(400).json({ error: "Username already exists" });
      }
      if (error.keyPattern?.email) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login User Create sessionToken
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userResponse } = user.toObject();

    res.json({
      message: "Login successful",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout User Delete sessionToken


// Delete User
router.delete("/account", verifyToken , async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace("Bearer ", "") || req.body.sessionToken;
    
    if (!sessionToken) {
      return res.status(401).json({ error: "Session token required" });
    }

    const decoded = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET
    );

    const user = await User.findByIdAndDelete(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: "user doesn't exist" });
    }

    res.json({ message: "deleted successfully" });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;