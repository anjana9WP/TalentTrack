const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['User', 'Admin', 'Evaluator'], required: true },
    bio: { type: String, default: "" },  //  optional bio
    profileImage: { type: String, default: "" },  //  optional profile picture path
    createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
