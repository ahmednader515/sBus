const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const AdminSchema = new Schema({
    type: {
        type: String,
        required: true,
    }
})

AdminSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('Admin', AdminSchema)