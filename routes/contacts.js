const express = require("express");
const Contact = require("../db/models/contacts.model");
const router = express.Router();

// POST /contacts create new contact
// DELETE /contacts/{contactID} delete a contact
// GET /contacts gets all contacts of user
// GET /contacts/{contactID} get info on specific contact
// PATCH /contacts/{contactID} update specific contact

// POST /contacts - create new contact
router.post("/", async (req, res) => {
    try {
        req.body.createdBy = req.user.userId;

        const contact = new Contact(req.body);
        const savedContact = await contact.save();

        await savedContact.populate("contactUserId", "userId");
        await savedContact.populate("createdBy", "userId");

        res.status(201).json(savedContact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /contacts/:id - Delete a contact
router.delete("/:id", async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }

        if (contact.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: "Contact deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /contacts - List all contacts
router.get("/", async (req, res) => {
    try {
        const filter = {};
        if (req.query.createdBy) {
            filter.createdBy = req.query.createdBy;
        }
        if (req.query.contactUserId) {
            filter.contactUserId = req.query.contactUserId;
        }

        const contacts = await Contact.find(filter)
            .populate("contactUserId", "name")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /contacts/:contactID - Get specific contact details
router.get("/:id", async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id)
            .populate("contactUserId", "userId")
            .populate("createdBy", "userId");

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }

        if (contact.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /contacts/:contactID - Update contact
router.patch("/:id", async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }

        if (contact.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate("contactUserId", "userId email")
            .populate("createdBy", "userId");

        res.json(updatedContact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;