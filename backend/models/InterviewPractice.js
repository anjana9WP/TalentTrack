const mongoose = require('mongoose');

const InterviewPracticeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: { type: String },
    question: { type: String },
    videoUrl: { type: String },
    feedback: { type: String },

    evaluatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    scheduledAt: {
        type: Date,
        required: false // allow null for uploads
    },

    slot: {
        type: String,
        enum: [
            '10:00 AM - 10:30 AM',
            '11:00 AM - 11:30 AM',
            '1:00 PM - 1:30 PM',
            '3:00 PM - 3:30 PM',
            '4:30 PM - 5:00 PM'
        ],
        required: false // enforce this manually in /book-slot
    },

    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Scheduled', 'Confirmed'],
        default: 'Pending'
    },

    interviewLink: {
        type: String,
        default: ''
    },

    score: {
        type: Number,
        min: 0,
        max: 10
    }

}, { timestamps: true });

// ✅ Enforce unique booking: 1 evaluator per slot per date
InterviewPracticeSchema.index(
    { evaluatorId: 1, slot: 1, scheduledAt: 1 },
    {
        unique: true,
        partialFilterExpression: {
            evaluatorId: { $exists: true },
            slot: { $exists: true },
            scheduledAt: { $exists: true }
        }
    }
);

const InterviewPracticeModel = mongoose.model('InterviewPractice', InterviewPracticeSchema);
module.exports = InterviewPracticeModel;
