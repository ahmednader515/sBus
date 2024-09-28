const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    username: {
        type: String,
        required: true, // Ensure username is required
        unique: true    // Ensure username is unique
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
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)