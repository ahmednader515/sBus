const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HalfTicketSchema = new Schema({
    username: String,
    clientname: String,
    number: String,
});

module.exports = mongoose.model('HalfTicket', HalfTicketSchema);