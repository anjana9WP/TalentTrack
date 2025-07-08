const express = require("express");
const router = express.Router();
const EventModel = require("../models/Event");
const UserModel = require("../models/User");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");
const sendEmail = require("../utils/emailService");

// Create an event (Admin only)
router.post("/create", authenticate, isAdmin, async (req, res) => {
    try {
        const { title, description, start, end, eventType, eventLink, location, maxParticipants } = req.body;

        if (!eventType || (eventType === 'Online' && !eventLink) || (eventType === 'Offline' && !location)) {
            return res.status(400).json({ error: "Please provide required event details." });
        }

        const event = await EventModel.create({
            title,
            description,
            start,
            end,
            createdBy: req.user.id,
            eventType,
            eventLink: eventType === "Online" ? eventLink : null,
            location: eventType === "Offline" ? location : null,
            maxParticipants,
        });

        res.status(201).json({ message: "Event created successfully", event });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Error creating event" });
    }
});

// Fetch all events
router.get("/", authenticate, async (req, res) => {
    try {
        const events = await EventModel.find();
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Error fetching events" });
    }
});

// Update an event (Admin only)
router.put("/:id", authenticate, isAdmin, async (req, res) => {
    try {
        const { title, description, start, end, eventType, eventLink, location, maxParticipants } = req.body;

        if (!eventType || (eventType === 'Online' && !eventLink) || (eventType === 'Offline' && !location)) {
            return res.status(400).json({ error: "Please provide required event details for the selected event type." });
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                start,
                end,
                eventType,
                eventLink: eventType === "Online" ? eventLink : null,
                location: eventType === "Offline" ? location : null,
                maxParticipants
            },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Error updating event" });
    }
});

// Delete an event (Admin only)
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
    try {
        const event = await EventModel.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Error deleting event" });
    }
});

// Register for an event (any authenticated user)
router.post("/register/:id", authenticate, async (req, res) => {
    try {
        const event = await EventModel.findOneAndUpdate(
            {
                _id: req.params.id,
                participants: { $ne: req.user.id },
                $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] }
            },
            { $addToSet: { participants: req.user.id } },
            { new: true }
        );

        if (!event) {
            return res.status(400).json({ error: "Already registered or event full." });
        }

        const user = await UserModel.findById(req.user.id);
        const emailSubject = `Registration Confirmation: ${event.title}`;
        const emailText = `Hello ${user.name || 'User'},\n\nYou have successfully registered for the event "${event.title}".\n\nEvent Details:\nStart: ${new Date(event.start).toLocaleString()}\nEnd: ${new Date(event.end).toLocaleString()}\n${event.eventType === "Online" ? `Link: ${event.eventLink}` : `Location: ${event.location}`}\n\nThank you,\nEvent Team`;

        sendEmail(user.email, emailSubject, emailText)
            .then(() => console.log(`Confirmation email sent to ${user.email}`))
            .catch(err => console.error("Error sending confirmation email:", err));

        res.json({ message: "Registration successful, confirmation email sent.", event });
    } catch (error) {
        console.error("Error registering for event:", error);
        res.status(500).json({ error: "Error registering for event" });
    }
});

// Unregister for an event (any authenticated user)
router.delete("/register/:id", authenticate, async (req, res) => {
    try {
        const event = await EventModel.findOneAndUpdate(
            { _id: req.params.id, participants: req.user.id },
            { $pull: { participants: req.user.id } },
            { new: true }
        );

        if (!event) {
            return res.status(400).json({ error: "User was not registered or event not found." });
        }

        res.json({ message: "Successfully unregistered from the event", event });
    } catch (error) {
        console.error("Error unregistering for event:", error);
        res.status(500).json({ error: "Error unregistering for event" });
    }
});

// Retrieve events the user has registered for
router.get("/my-registrations", authenticate, async (req, res) => {
    try {
        const events = await EventModel.find({ participants: req.user.id });
        res.json(events);
    } catch (error) {
        console.error("Error fetching registered events:", error);
        res.status(500).json({ error: "Error fetching registered events" });
    }
});

// Get registrations for an event (Admin only)
router.get("/:id/registrations", authenticate, isAdmin, async (req, res) => {
    try {
        const event = await EventModel.findById(req.params.id)
            .populate('participants', 'name email');
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json({ eventId: event._id, title: event.title, participants: event.participants });
    } catch (error) {
        console.error("Error fetching registrations for event:", error);
        res.status(500).json({ error: "Error fetching registrations for event" });
    }
});

module.exports = router;
