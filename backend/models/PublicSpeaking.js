// backend/models/PublicSpeaking.js
const mongoose = require('mongoose');

const PublicSpeakingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  feedback: { type: String },
  score: { type: Number, min: 0, max: 10 },
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pending', 'Reviewed', 'In Pool'],  // Added 'In Pool' to the enum values
    default: 'Pending' 
  }
});

const PublicSpeakingModel = mongoose.model('PublicSpeaking', PublicSpeakingSchema);

module.exports = PublicSpeakingModel;
