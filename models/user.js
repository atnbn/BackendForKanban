const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmedPassword: { type: String, required: true },
    userId: { type: String },
    boards: { type: String }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
