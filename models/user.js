const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        lowercase: true,
        enum: ['user', 'admin', 'owner']
    }
});

// Disable email field creation
UserSchema.plugin(passportLocalMongoose, { usernameField: 'username', usernameUnique: true });

module.exports = mongoose.model('User', UserSchema);