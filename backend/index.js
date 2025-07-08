const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./config/connectDatabase");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Import middlewares
const { authenticate, isStudent, isAdmin, isEvaluator } = require("./middlewares/authMiddleware");

// Import route modules
const authRoutes = require("./routes/authRoutes");
const publicSpeakingRoutes = require("./routes/publicSpeakingRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const writtenCommunicationRoutes = require("./routes/writtenCommunicationRoutes");
const criticalThinkingRoutes = require("./routes/criticalThinkingRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes"); //  NEW LINE
const aiRoutes = require('./routes/ai'); // NEW: AI generation route



// Import node-cron, Event model, and sendEmail utility for notifications
const nodeCron = require("node-cron");
const EventModel = require("./models/Event");
const sendEmail = require("./utils/emailService");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "config", "config.env") });

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from 'uploads' directory
console.log("Serving static files from:", path.join(__dirname, '..', 'uploads'));
console.log("Absolute path:", path.join(__dirname, '..', 'uploads'));
console.log("Dirname:", __dirname);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));  // Serve video/profile image files

// Base route
app.get("/", (req, res) => {
    res.send("Server is ready!");
});

// Modular Routes
app.use("/api/auth", authRoutes);
app.use("/api/public-speaking", publicSpeakingRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/written-communication", writtenCommunicationRoutes);
app.use("/api/critical-thinking", criticalThinkingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/user", userProfileRoutes); // ✅ NEW LINE
app.use("/api/ai", aiRoutes); // NEW LINE



// Role-based inline routes
app.get("/student-resource", authenticate, isStudent, (req, res) => {
    res.json({ message: "Welcome, Student!" });
});

app.get("/admin-resource", authenticate, isAdmin, (req, res) => {
    res.json({ message: "Welcome, Admin!" });
});

app.get("/evaluator-resource", authenticate, isEvaluator, (req, res) => {
    res.json({ message: "Welcome, Evaluator!" });
});

// Cron job: Check every minute for events starting in 10 minutes and send reminders
nodeCron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

        const eventsToNotify = await EventModel.find({
            start: {
                $gte: tenMinutesFromNow,
                $lt: new Date(tenMinutesFromNow.getTime() + 60 * 1000)
            },
            reminderSent: false
        }).populate('participants', 'email name');

        for (const event of eventsToNotify) {
            for (const participant of event.participants) {
                const emailSubject = `Reminder: Your event "${event.title}" starts in 10 minutes`;
                const emailText = `
Hello ${participant.name || 'User'},

This is a friendly reminder that the event "${event.title}" is starting in about 10 minutes.

Event Details:
- Start: ${new Date(event.start).toLocaleString()}
- End: ${new Date(event.end).toLocaleString()}
${event.eventType === "Online" ? `Link: ${event.eventLink}` : `Location: ${event.location}`}

We look forward to seeing you there!

Regards,
Event Team
                `.trim();

                await sendEmail(participant.email, emailSubject, emailText);
            }

            event.reminderSent = true;
            await event.save();
        }
    } catch (error) {
        console.error('Error sending reminder emails:', error);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
