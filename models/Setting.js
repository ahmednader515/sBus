const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = new Schema({
    ticketFromStation: {
        type: String,
    },
    fromStation: {
        type: String,
    },
    price: {
        type: Number,
    },
    cardType: {
        type: String,
    }
});

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;