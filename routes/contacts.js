const express = require("express");
const Contact = require("../db/models/contacts.model");
const router = express.Router();

// POST /contacts create new contact
// DELETE /contacts/{contactID} delete a contact
// GET /contacts gets all contacts of user
// GET /contacts/{contactID} get info on specific contact
// PATCH /contacts/{contactID} update specific contact

module.exports = router;