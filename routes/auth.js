const express = require('express');
const path = require("path");
const User = require('../db/models/users.model');
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const message = await User.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email
    });
    res.status(201).json(message);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Error' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

/*
    // Create user
    const newUser = await UserService.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    });
    console.log('User created:', newUser);

    // Get all users
    const users = await UserService.getAllUsers();
    console.log('All users:', users);
*/

