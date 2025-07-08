const Evaluator = require('../models/Evaluator');
const PublicSpeaking = require('../models/PublicSpeaking'); // Public Speaking model
const WrittenCommunication = require('../models/WrittenCommunication'); // Written Communication model
const InterviewPractice = require('../models/InterviewPractice'); // Interview Practice model

// Function to assign evaluator to a task (e.g., public speaking, written communication, or interview practice)
async function assignEvaluator(taskId, taskType) {
    try {
        // Fetch all active evaluators from the database
        const evaluators = await Evaluator.find({ isActive: true });

        // If no active evaluators are found, log the message and return null
        if (evaluators.length === 0) {
            console.log("No active evaluators available. Task will be assigned later.");
            let task;
            if (taskType === "publicSpeaking") {
                task = await PublicSpeaking.findById(taskId);
            } else if (taskType === "writtenCommunication") {
                task = await WrittenCommunication.findById(taskId);
            }

            if (task) {
                task.status = "In Pool"; // Keep in pool for future reassignment
                await task.save();
            }
            return null;
        }

        // Randomly select an active evaluator
        const randomEvaluator = evaluators[Math.floor(Math.random() * evaluators.length)];

        let task;
        if (taskType === "publicSpeaking") {
            task = await PublicSpeaking.findById(taskId);
        } else if (taskType === "writtenCommunication") {
            task = await WrittenCommunication.findById(taskId);
        } else {
            throw new Error("Invalid task type provided.");
        }

        if (!task) {
            throw new Error(`Task with ID ${taskId} not found.`);
        }

        // Assign the evaluator and update task status
        task.evaluatorId = randomEvaluator._id;
        task.status = "Pending";
        await task.save();

        // Save the evaluator's updated task list
        randomEvaluator.assignedTasks.push(task._id);
        await randomEvaluator.save();

        console.log(`Evaluator ${randomEvaluator._id} assigned to task ${taskId}`);
        return randomEvaluator;
    } catch (error) {
        console.error("Error assigning evaluator:", error);
        throw error;
    }
}

// Function to handle unassigned "In Pool" tasks dynamically
async function assignEvaluatorsForPoolTasks() {
    try {
        const publicSpeakingPoolTasks = await PublicSpeaking.find({ status: "In Pool" });
        for (const task of publicSpeakingPoolTasks) {
            await assignEvaluator(task._id, "publicSpeaking");
        }

        const writtenCommunicationPoolTasks = await WrittenCommunication.find({ status: "In Pool" });
        for (const task of writtenCommunicationPoolTasks) {
            await assignEvaluator(task._id, "writtenCommunication");
        }
    } catch (error) {
        console.error("Error assigning evaluators for pool tasks:", error);
    }
}

// Export the functions to be used in other parts of the application
module.exports = { assignEvaluator, assignEvaluatorsForPoolTasks };
