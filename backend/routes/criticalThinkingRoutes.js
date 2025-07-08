const express = require("express");
const router = express.Router();
const CriticalThinkingModel = require("../models/CriticalThinking");
const ScenarioModel = require("../models/CriticalThinkingScenario");
const { authenticate } = require("../middlewares/authMiddleware");

// ✅ Submit a critical thinking exercise
router.post("/submit", authenticate, async (req, res) => {
  try {
    const { question, answer, score } = req.body;

    // Lookup scenario to get the subject
    const scenario = await ScenarioModel.findOne({ title: question });
    const subject = scenario?.subject || "Unknown";

    // Generate automated feedback
    const feedback = score === 0 ? "Try again!" : "Excellent!";

    const exercise = await CriticalThinkingModel.create({
      userId: req.user.id,
      question,
      answer,
      score,
      subject,
      feedback,
      status: "Marked",
    });

    res.status(201).json({ message: "Exercise submitted successfully", exercise });
  } catch (error) {
    console.error("Error submitting exercise:", error);
    res.status(500).json({ error: "Error submitting exercise" });
  }
});

// ✅ Fetch reviewed exercises for a user
router.get("/reviews", authenticate, async (req, res) => {
  try {
    const reviews = await CriticalThinkingModel.find({
      userId: req.user.id,
      status: "Marked",
    }).populate("userId", "name");

    res.status(200).json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

// ✅ Add new scenario (admin only)
router.post("/scenarios", authenticate, async (req, res) => {
  try {
    const { title, reference, paragraph, questions, subject } = req.body;
    const newScenario = await ScenarioModel.create({ title, reference, paragraph, questions, subject });
    res.status(201).json({ message: "Scenario created successfully", scenario: newScenario });
  } catch (error) {
    console.error("Error saving scenario:", error);
    res.status(500).json({ error: "Failed to save scenario" });
  }
});

// ✅ Fetch all scenarios
router.get("/scenarios", authenticate, async (req, res) => {
  try {
    const scenarios = await ScenarioModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({ scenarios });
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    res.status(500).json({ error: "Failed to fetch scenarios" });
  }
});

// ✅ Delete scenario
router.delete("/scenarios/:id", authenticate, async (req, res) => {
  try {
    await ScenarioModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Scenario deleted successfully" });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    res.status(500).json({ error: "Failed to delete scenario" });
  }
});

// ✅ Update scenario
router.put("/scenarios/:id", authenticate, async (req, res) => {
  try {
    const { title, reference, paragraph, questions, subject } = req.body;

    const updatedScenario = await ScenarioModel.findByIdAndUpdate(
      req.params.id,
      { title, reference, paragraph, questions, subject },
      { new: true }
    );

    res.status(200).json({ message: "Scenario updated successfully", scenario: updatedScenario });
  } catch (error) {
    console.error("Error updating scenario:", error);
    res.status(500).json({ error: "Failed to update scenario" });
  }
});


module.exports = router;
