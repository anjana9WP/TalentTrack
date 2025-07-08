const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const PublicSpeakingModel = require("../models/PublicSpeaking");
const { authenticate, isEvaluator } = require("../middlewares/authMiddleware");
const { assignEvaluator, assignEvaluatorsForPoolTasks } = require("../utils/evaluatorManagement");

// Set storage engine using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set folder to save uploaded videos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique filename using timestamp
  },
});

// Initialize upload variable with file size limit (100MB) and file type filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 100MB limit for video file size
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only videos are allowed"), false);
    }
  },
});

// Submit a speech for evaluation (using multer middleware)
router.post("/submit", authenticate, upload.single("video"), async (req, res) => {
  try {
    const { title } = req.body;
    const videoUrl = `/uploads/${req.file.filename}`; // URL path for the uploaded video

    // Create speech entry in the database
    const speech = await PublicSpeakingModel.create({
      title,
      videoUrl,
      userId: req.user.id,
    });

    // Assign an evaluator to the speech
    const evaluator = await assignEvaluator(speech._id, "publicSpeaking");

    // Send a response confirming the speech submission
    res.status(201).json({
      message: "Speech submitted successfully",
      speech,
    });
  } catch (error) {
    console.error("Error submitting speech:", error);
    res.status(500).json({ error: "Error submitting speech" });
  }
});

// Get unmarked speeches assigned to the evaluator
router.get("/unmarked", authenticate, isEvaluator, async (req, res) => {
  try {
    const evaluatorId = req.user.id;

    // Assign evaluators for any tasks in the pool
    await assignEvaluatorsForPoolTasks();

    // Fetch speeches assigned to the evaluator with status 'Pending'
    const unmarkedSpeeches = await PublicSpeakingModel.find({
      evaluatorId: evaluatorId,
      status: "Pending",
    }).populate("userId", "name"); // Include user name for display

    res.status(200).json({ unmarkedSpeeches });
  } catch (error) {
    console.error("Error fetching unmarked speeches:", error);
    res.status(500).json({ error: "Error fetching unmarked speeches" });
  }
});

// Evaluator submits feedback for a speech
router.put("/feedback/:speechId", authenticate, async (req, res) => {
  try {
    const { speechId } = req.params;
    const { feedback, score } = req.body;
    const evaluatorId = req.user.id;

    // Find the speech to update
    const speech = await PublicSpeakingModel.findById(speechId);

    // Check if the evaluator is assigned to the task
    if (speech.evaluatorId.toString() !== evaluatorId) {
      return res.status(403).json({ error: "You are not assigned to evaluate this speech." });
    }

    // Log for debugging
    console.log("Received score:", score);

    // Update the feedback and change status to "Reviewed"
    speech.feedback = feedback;
    speech.score = score;
    speech.status = "Reviewed";
    speech.evaluatorId = evaluatorId;

    // Save the updated speech
    await speech.save();

    // Send a response confirming the feedback submission
    res.status(200).json({ message: "Feedback submitted successfully", speech });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Error submitting feedback" });
  }
});

// Fetch public speaking reviews for the logged-in user
router.get("/reviews", authenticate, async (req, res) => {
  try {
    // Find all reviewed submissions for the logged-in user
    const reviews = await PublicSpeakingModel.find({
      userId: req.user.id,
      status: "Reviewed",
    }).populate("evaluatorId", "name email"); // Include evaluator details

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
});


// Get speech feedback for a user
router.get("/feedback/:speechId", authenticate, async (req, res) => {
  try {
    const { speechId } = req.params;
    const speech = await PublicSpeakingModel.findById(speechId);

    if (!speech) {
      return res.status(404).json({ error: "Speech not found" });
    }

    // Ensure the requesting user is either the submitter or the evaluator
    if (
      speech.userId.toString() !== req.user.id &&
      speech.evaluatorId.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "You are not authorized to view this speech's feedback." });
    }

    res.status(200).json({ speech });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Error fetching feedback" });
  }
});

// Get sample good and bad speeches with tips
router.get("/samples", async (req, res) => {
  try {
    const goodSpeech = {
      title: "Good Speech Sample",
      videoUrl: "good-speech-video-url",
      tips: "Clear articulation, engaging content, confident delivery",
    };

    const badSpeech = {
      title: "Bad Speech Sample",
      videoUrl: "bad-speech-video-url",
      tips: "Monotone voice, unclear content, poor body language",
    };

    res.status(200).json({ goodSpeech, badSpeech });
  } catch (error) {
    console.error("Error fetching speech samples:", error);
    res.status(500).json({ error: "Error fetching speech samples" });
  }
});

module.exports = router;
