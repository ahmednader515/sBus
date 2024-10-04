const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packageTicketSchema = new Schema({
  packageNumber: {
    type: Number,
    required: true,
  },
  package: {
    type: Schema.Types.ObjectId,
    ref: 'Package',
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  billNumber: {
    type: String,
  },
  senderName: {
    type: String,
  },
  senderPhoneNumber: {
    type: String,
  },
  senderCardNumber: {
    type: String,
  },
  recieverName: {
    type: String,
  },
  recieverPhoneNumber: {
    type: String,
  },
  packageContent: {
    type: String,
  },
  packagePrice: {
    type: Number,
  },
  workerName: {
    type: Schema.Types.ObjectId, ref: 'User', default: null 
  },
});

const PackageTicket = mongoose.model('PackageTicket', packageTicketSchema);
module.exports = PackageTicket;