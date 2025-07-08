// backend/models/CriticalThinking.js
const mongoose = require('mongoose');

const CriticalThinkingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number },
    feedback: { type: String },
    status: { type: String, enum: ['Marked'], default: 'Marked' },
    submittedAt: { type: Date, default: Date.now }
});

const CriticalThinkingModel = mongoose.model('CriticalThinking', CriticalThinkingSchema);
module.exports = CriticalThinkingModel;
