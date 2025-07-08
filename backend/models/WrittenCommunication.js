const mongoose = require('mongoose');

const WrittenCommunicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Email', 'Essay', 'Formal Letter', 'Informal Letter', 'Blog'], required: true }, // ✅ NEW
  content: { type: String },
  feedback: { type: String },
  score: { type: Number, min: 0, max: 10 },
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'In Pool'],
    default: 'Pending',
  },
  documentUrl: { type: String },
});

const WrittenCommunicationModel = mongoose.model('WrittenCommunication', WrittenCommunicationSchema);
module.exports = WrittenCommunicationModel;


