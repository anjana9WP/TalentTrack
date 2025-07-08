const express = require("express");
const router = express.Router();
const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");
const PublicSpeakingModel = require("../models/PublicSpeaking");
const WrittenCommunicationModel = require("../models/WrittenCommunication");
const CriticalThinkingModel = require("../models/CriticalThinking");
const InterviewPracticeModel = require("../models/InterviewPractice");

// ===============================
// 🔐 Auth Routes
// ===============================

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, mobileNumber, role = "User" } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      role,
    });

    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    console.error("Error during user creation:", error);
    if (error.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Error creating user" });
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login error" });
  }
});

// Get profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Error retrieving profile" });
  }
});

// ===============================
// 🛠️ Admin Evaluator Management
// ===============================

router.get("/admin/evaluators", authenticate, isAdmin, async (req, res) => {
  try {
    const evaluators = await UserModel.find({ role: "Evaluator" }).select("-password");
    res.json({ evaluators });
  } catch (error) {
    console.error("Error fetching evaluators:", error);
    res.status(500).json({ error: "Failed to fetch evaluators" });
  }
});

router.post("/admin/evaluators", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newEvaluatorUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: "Evaluator",
      isActive: false,
    });

    const EvaluatorModel = require("../models/Evaluator");
    const newEvaluatorMeta = await EvaluatorModel.create({
      _id: newEvaluatorUser._id,
      name,
      email,
      isActive: true,
    });

    res.status(201).json({
      message: "Evaluator registered successfully in both models",
      user: newEvaluatorUser,
      evaluatorMeta: newEvaluatorMeta,
    });
  } catch (error) {
    console.error("Error adding evaluator:", error);
    res.status(500).json({ error: "Failed to add evaluator" });
  }
});

router.put("/admin/evaluators/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await UserModel.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select("-password");
    if (!updated) return res.status(404).json({ error: "Evaluator not found" });
    res.json({ message: "Evaluator updated", evaluator: updated });
  } catch (error) {
    console.error("Error updating evaluator:", error);
    res.status(500).json({ error: "Failed to update evaluator" });
  }
});

router.patch("/admin/evaluators/:id/status", authenticate, isAdmin, async (req, res) => {
  try {
    const evaluator = await UserModel.findById(req.params.id);
    if (!evaluator || evaluator.role !== "Evaluator") {
      return res.status(404).json({ error: "Evaluator not found" });
    }

    evaluator.isActive = !evaluator.isActive;
    await evaluator.save();

    res.json({ message: `Evaluator ${evaluator.isActive ? "activated" : "deactivated"}`, evaluator });
  } catch (error) {
    console.error("Error toggling evaluator status:", error);
    res.status(500).json({ error: "Failed to update evaluator status" });
  }
});

router.delete("/admin/evaluators/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const evaluatorId = req.params.id;
    const userDeleted = await UserModel.findByIdAndDelete(evaluatorId);
    const EvaluatorModel = require("../models/Evaluator");
    await EvaluatorModel.findByIdAndDelete(evaluatorId);

    if (!userDeleted) {
      return res.status(404).json({ error: "Evaluator not found in user list" });
    }

    res.json({ message: "Evaluator deleted successfully" });
  } catch (error) {
    console.error("Error deleting evaluator:", error);
    res.status(500).json({ error: "Failed to delete evaluator" });
  }
});

// ===============================
// 🛠️ Admin User Management
// ===============================

// GET all users
router.get("/admin/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST add new user
router.post("/admin/users", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Failed to add user" });
  }
});

// PUT update user
router.put("/admin/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updated = await UserModel.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select("-password");
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated", user: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE user
router.delete("/admin/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const userDeleted = await UserModel.findByIdAndDelete(req.params.id);
    if (!userDeleted) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});


const monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Dashboard Stats
router.get("/admin/dashboard-stats", authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();

    const roleAggregation = await UserModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const roles = {};
    roleAggregation.forEach((r) => {
      roles[r._id] = r.count;
    });

    const publicSpeaking = await PublicSpeakingModel.countDocuments();
    const writtenCommunication = await WrittenCommunicationModel.countDocuments();
    const criticalThinking = await CriticalThinkingModel.countDocuments();

    res.json({
      totalUsers,
      roles,
      submissions: {
        publicSpeaking,
        writtenCommunication,
        criticalThinking,
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Dashboard Monthly Charts
router.get("/admin/dashboard-monthly", authenticate, isAdmin, async (req, res) => {
  try {
    const studentGrowthRaw = await UserModel.aggregate([
      { $match: { role: "User" } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const studentGrowth = studentGrowthRaw.map((entry) => ({
      month: monthMap[entry._id - 1],
      count: entry.count,
    }));

    const reviewAggregation = async (Model, field) => {
      return await Model.aggregate([
        { $group: { _id: { $month: `$${field}` }, count: { $sum: 1 } } }
      ]);
    };

    const [ps, wc, ct] = await Promise.all([
      reviewAggregation(PublicSpeakingModel, "submittedAt"),
      reviewAggregation(WrittenCommunicationModel, "submittedAt"),
      reviewAggregation(CriticalThinkingModel, "submittedAt"),
    ]);

    const combined = [...ps, ...wc, ...ct];
    const evaluatorActivityMap = {};

    combined.forEach(({ _id, count }) => {
      evaluatorActivityMap[_id] = (evaluatorActivityMap[_id] || 0) + count;
    });

    const evaluatorActivity = Object.keys(evaluatorActivityMap)
      .sort((a, b) => a - b)
      .map((monthNum) => ({
        month: monthMap[monthNum - 1],
        count: evaluatorActivityMap[monthNum],
      }));

    res.json({ studentGrowth, evaluatorActivity });
  } catch (error) {
    console.error("Error fetching monthly stats:", error);
    res.status(500).json({ error: "Failed to fetch monthly stats" });
  }
});


module.exports = router;
