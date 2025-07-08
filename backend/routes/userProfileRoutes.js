const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { authenticate } = require('../middlewares/authMiddleware');

// Models for score computation
const PublicSpeaking = require('../models/PublicSpeaking');
const WrittenCommunication = require('../models/WrittenCommunication');
const CriticalThinking = require('../models/CriticalThinking');
// InterviewPractice intentionally excluded (not using scores yet)

// Storage config for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, 'profile_' + Date.now() + ext);
    }
});
const upload = multer({ storage: storage });


// GET full profile with stats
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // --- Calculate Averages ---
        const userId = req.user.id;

        const calculateAverage = (items) => {
            const valid = items.filter(item => typeof item.score === 'number');
            if (valid.length === 0) return null;
            const total = valid.reduce((sum, item) => sum + item.score, 0);
            return parseFloat((total / valid.length).toFixed(2));
        };

        const [publicSpeakingEntries, writtenCommEntries, criticalThinkingEntries] = await Promise.all([
            PublicSpeaking.find({ userId, status: 'Reviewed', score: { $ne: null } }),
            WrittenCommunication.find({ userId, status: 'Reviewed', score: { $ne: null } }),
            CriticalThinking.find({ userId, score: { $ne: null } }),
        ]);

        const scores = {
            publicSpeaking: calculateAverage(publicSpeakingEntries),
            writtenCommunication: calculateAverage(writtenCommEntries),
            criticalThinking: calculateAverage(criticalThinkingEntries),
            interviewPractice: null // Reserved for future use
        };

        res.json({ user, scores });

    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// PUT update user profile (name, email, bio)
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email, bio } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, bio },
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile updated', user: updated });
    } catch (err) {
        res.status(500).json({ message: 'Profile update failed' });
    }
});


// POST upload profile picture
router.post('/profile/picture', authenticate, upload.single('profileImage'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: filePath },
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile image uploaded', profileImage: filePath, user });
    } catch (err) {
        res.status(500).json({ message: 'Image upload failed' });
    }
});

module.exports = router;
