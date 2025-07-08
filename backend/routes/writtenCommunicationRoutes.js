const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const WrittenCommunicationModel = require("../models/WrittenCommunication");
const { authenticate } = require("../middlewares/authMiddleware");
const { assignEvaluator, assignEvaluatorsForPoolTasks } = require("../utils/evaluatorManagement");
const { isEvaluator } = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only .pdf, .doc, and .docx are allowed"), false);
    }
  },
});

router.post("/submit", authenticate, upload.single("document"), async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !type || (!documentUrl && !content)) {
      return res.status(400).json({ error: "Title, writing type, and either document or content are required." });
    }

    const task = await WrittenCommunicationModel.create({
      title,
      type,
      content: content || null,
      documentUrl,
      userId: req.user.id,
      status: "In Pool",
    });

    const evaluator = await assignEvaluator(task._id, "writtenCommunication");
    if (evaluator) {
      task.evaluatorId = evaluator._id;
      task.status = "Pending";
      await task.save();
    }

    res.status(201).json({ message: "Task submitted successfully", task });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ error: "An error occurred while submitting the task." });
  }
});

router.get("/unmarked", authenticate, isEvaluator, async (req, res) => {
  try {
    const evaluatorId = req.user.id;
    await assignEvaluatorsForPoolTasks();
    const unmarkedTasks = await WrittenCommunicationModel.find({
      evaluatorId: evaluatorId,
      status: "Pending",
    }).populate("userId", "name");

    res.status(200).json({ unmarkedTasks });
  } catch (error) {
    console.error("Error fetching unmarked tasks:", error);
    res.status(500).json({ error: "Error fetching unmarked tasks" });
  }
});

router.put("/feedback/:taskId", authenticate, isEvaluator, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { feedback, score } = req.body;

    if (!feedback || !score) {
      return res.status(400).json({ error: "Feedback and score are required." });
    }

    const task = await WrittenCommunicationModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (task.evaluatorId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not assigned to evaluate this task." });
    }

    task.feedback = feedback;
    task.score = score;
    task.status = "Reviewed";
    await task.save();

    res.status(200).json({ message: "Feedback submitted successfully", task });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Error submitting feedback." });
  }
});

router.get("/reviews", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await WrittenCommunicationModel.find({
      userId,
      status: "Reviewed",
    }).populate("evaluatorId", "name");

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching written communication reviews:", error);
    res.status(500).json({ error: "Error fetching reviews." });
  }
});

module.exports = router;