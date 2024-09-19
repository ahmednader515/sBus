const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const OwnerSchema = new Schema({
    email : {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
    }
})

OwnerSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Owner', OwnerSchema)