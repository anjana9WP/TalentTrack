const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to authenticate user by verifying the JWT
const authenticate = (req, res, next) => {
    const token = req.body.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing.",
        });
    }

    try {
        // Verify token and attach user data to the request object
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains user ID, role, etc.
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

// Middleware to check if the user is a Student
const isStudent = (req, res, next) => {
    if (req.user.role !== "Student") {
        return res.status(403).json({
            success: false,
            message: "Access denied. You must be a Student to access this resource.",
        });
    }
    next();
};

// Middleware to check if the user is an Admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. You must be an Admin to access this resource.",
        });
    }
    next();
};

// Middleware to check if the user is an Evaluator
const isEvaluator = (req, res, next) => {
    if (req.user.role !== "Evaluator") {
        return res.status(403).json({
            success: false,
            message: "Access denied. You must be an Evaluator to access this resource.",
        });
    }
    next();
};

module.exports = {
    authenticate,
    isStudent,
    isAdmin,
    isEvaluator,
};
