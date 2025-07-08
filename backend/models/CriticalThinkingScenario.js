const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String
});

const ScenarioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reference: { type: String },
  paragraph: { type: String, required: true },
  subject: { type: String, required: true },
  questions: [QuestionSchema]
}, { timestamps: true }); 

const CriticalThinkingScenario = mongoose.model('CriticalThinkingScenario', ScenarioSchema);
module.exports = CriticalThinkingScenario;