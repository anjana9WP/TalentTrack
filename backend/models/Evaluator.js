const mongoose = require('mongoose');

const evaluatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false }, // Add isActive field
    assignedTasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicSpeaking' // References to tasks like PublicSpeaking
        }
    ],
    feedbackGiven: [
        {
            taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'PublicSpeaking' }, // Reference to the task
            feedback: { type: String },
            grade: { type: String }
        }
    ]
});

const Evaluator = mongoose.model('Evaluator', evaluatorSchema);
module.exports = Evaluator;
