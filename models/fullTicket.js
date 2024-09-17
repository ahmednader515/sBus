const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FullTicketSchema = new Schema({
    username: String,
    clientname: String,
    number: String,
});

module.exports = mongoose.model('FullTicket', FullTicketSchema);