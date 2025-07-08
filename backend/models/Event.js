// models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxParticipants: { type: Number, required: true }, // Maximum allowed participants
    eventType: { type: String, enum: ['Online', 'Offline'], required: true }, // Online or Offline
    eventLink: { type: String, required: function () { return this.eventType === 'Online'; } }, // Required if online
    location: { type: String, required: function () { return this.eventType === 'Offline'; } }, // Required if offline

    // -------------- NEW FIELD ADDED BELOW --------------
    // This boolean will track if the 10-mins-before reminder is already sent.
    reminderSent: { type: Boolean, default: false },
    // ----------------------------------------------------
});

const EventModel = mongoose.model('Event', EventSchema);
module.exports = EventModel;


