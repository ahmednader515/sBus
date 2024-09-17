const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PackageTicketSchema = new Schema({
    username: String,
    clientname: String,
    number: String,
});

module.exports = mongoose.model('PackageTicket', PackageTicketSchema);