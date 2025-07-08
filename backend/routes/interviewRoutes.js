const express = require("express");
const router = express.Router();
const InterviewPracticeModel = require("../models/InterviewPractice");
const User = require("../models/User");
const { authenticate, isEvaluator } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
    storage,
    limits: { fileSize: 100000000 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("video/")) cb(null, true);
        else cb(new Error("Invalid file type, only videos are allowed"), false);
    },
});

// -------------------- VIDEO UPLOAD --------------------
router.post("/upload", authenticate, upload.single("video"), async (req, res) => {
    try {
        const { title, slot, date } = req.body;
        const videoUrl = `/uploads/${req.file.filename}`;
        const evaluators = await User.find({ role: "Evaluator" });
        if (!evaluators.length) return res.status(500).json({ error: "No evaluators available" });

        const randomEvaluator = evaluators[Math.floor(Math.random() * evaluators.length)];

        const data = {
            userId: req.user.id,
            videoUrl,
            status: "Pending",
            evaluatorId: randomEvaluator._id,
        };

        if (title) data.title = title;
        if (slot) data.slot = slot;
        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            data.scheduledAt = d;
        }

        await InterviewPracticeModel.create(data);
        res.status(201).json({ message: "Video uploaded successfully!", videoUrl });
    } catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({ error: "Failed to upload video. Please try again." });
    }
});

// -------------------- SUBMIT RESPONSE --------------------
router.post("/submit", authenticate, async (req, res) => {
    try {
        const { jobCategory, response } = req.body;
        const interview = await InterviewPracticeModel.create({
            jobCategory,
            response,
            userId: req.user.id,
        });
        res.status(201).json({ message: "Response submitted successfully", interview });
    } catch (error) {
        res.status(500).json({ error: "Error submitting response" });
    }
});

// -------------------- BOOK SLOT --------------------
router.post("/book-slot", authenticate, async (req, res) => {
    try {
        const { slot, date } = req.body;
        if (!slot || !date) {
            return res.status(400).json({ error: "Slot and date are required" });
        }

        const normalizedSlot = slot.replace(/\s*–\s*/g, ' - ').trim();
        const scheduledDate = new Date(date);
        scheduledDate.setHours(0, 0, 0, 0);

        const evaluators = await User.find({ role: "Evaluator" });
        if (!evaluators.length) {
            return res.status(500).json({ error: "No evaluators available" });
        }

        for (const evaluator of evaluators) {
            const conflict = await InterviewPracticeModel.findOne({
                evaluatorId: evaluator._id,
                slot: normalizedSlot,
                scheduledAt: scheduledDate,
                status: { $in: ['Pending', 'Scheduled', 'Confirmed', 'Reviewed'] }
            });

            if (!conflict) {
                const booking = await InterviewPracticeModel.create({
                    userId: req.user.id,
                    scheduledAt: scheduledDate,
                    slot: normalizedSlot,
                    status: "Scheduled",
                    evaluatorId: evaluator._id,
                });
                return res.status(201).json({ message: "Slot booked successfully!", booking });
            }
        }

        return res.status(409).json({ error: "No available evaluators for this slot" });
    } catch (error) {
        console.error("Error booking slot:", error);
        res.status(500).json({ error: "Error booking slot" });
    }
});

// -------------------- GET USER INTERVIEWS --------------------
router.get("/", authenticate, async (req, res) => {
    try {
        const responses = await InterviewPracticeModel.find({ userId: req.user.id })
            .populate('evaluatorId', 'name email');
        res.json(responses);
    } catch (error) {
        res.status(500).json({ error: "Error fetching interview responses" });
    }
});

// -------------------- EVALUATOR FETCH --------------------
router.get("/scheduled", authenticate, isEvaluator, async (req, res) => {
    try {
        const interviews = await InterviewPracticeModel.find({
            status: "Scheduled",
            evaluatorId: req.user.id
        }).populate('userId', 'name email');
        res.json(interviews);
    } catch (error) {
        res.status(500).json({ error: "Error fetching scheduled interviews" });
    }
});

router.get("/pending", authenticate, isEvaluator, async (req, res) => {
    try {
        const pendingInterviews = await InterviewPracticeModel.find({
            status: "Pending",
            evaluatorId: req.user.id
        }).populate('userId', 'name email');
        res.json(pendingInterviews);
    } catch (error) {
        res.status(500).json({ error: "Error fetching pending interviews" });
    }
});

router.get("/all", authenticate, isEvaluator, async (req, res) => {
    try {
        const interviews = await InterviewPracticeModel.find({
            evaluatorId: req.user.id
        }).populate('userId', 'name email');
        res.json(interviews);
    } catch (error) {
        console.error("Error fetching all interviews:", error);
        res.status(500).json({ error: "Error fetching interviews" });
    }
});

// -------------------- CONFIRM INTERVIEW --------------------
router.post("/confirm/:id", authenticate, isEvaluator, async (req, res) => {
    try {
        const { interviewLink } = req.body;
        const interview = await InterviewPracticeModel.findById(req.params.id);
        if (!interview) return res.status(404).json({ error: "Interview not found" });
        if (interview.evaluatorId.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not assigned to this interview" });
        }

        interview.status = "Confirmed";
        interview.interviewLink = interviewLink;
        await interview.save();

        res.json({ message: "Interview confirmed successfully", interview });
    } catch (error) {
        console.error("Error confirming interview:", error);
        res.status(500).json({ error: "Error confirming interview" });
    }
});

// -------------------- DELETE INTERVIEW --------------------
router.delete("/:id", authenticate, isEvaluator, async (req, res) => {
    try {
        const interview = await InterviewPracticeModel.findByIdAndDelete(req.params.id);
        if (!interview) return res.status(404).json({ error: "Interview not found" });
        res.json({ message: "Interview deleted successfully" });
    } catch (error) {
        console.error("Error deleting interview:", error);
        res.status(500).json({ error: "Error deleting interview" });
    }
});

// -------------------- REVIEW INTERVIEW --------------------
router.post("/review/:id", authenticate, isEvaluator, async (req, res) => {
    try {
        const { score, feedback } = req.body;
        const interview = await InterviewPracticeModel.findById(req.params.id);
        if (!interview) return res.status(404).json({ error: "Interview not found" });
        if (interview.evaluatorId.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not assigned to this interview" });
        }

        interview.score = score;
        interview.feedback = feedback;
        interview.status = "Reviewed";
        await interview.save();

        res.json({ message: "Interview reviewed successfully", interview });
    } catch (error) {
        console.error("Error reviewing interview:", error);
        res.status(500).json({ error: "Error reviewing interview" });
    }
});

module.exports = router;
