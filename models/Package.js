const { required, boolean } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packageSchema = new Schema({
  serial: {
    type: Number,
    required: true
  },
  date: {
    type: String,
  },
  billNumber: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderPhoneNumber: {
    type: String,
    required: true
  },
  senderCardNumber: {
    type: String,
    required: true
  },
  recieverName: {
    type: String,
    required: true,
  },
  recieverPhoneNumber: {
    type: String,
    required: true,
  },
  packageContents: {
    type: String,
  },
  price: {
    type: String,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  packageNumber: {
    type: String,  // Seat number for the ticket
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});


const Package = mongoose.model('Package', packageSchema);
module.exports = Package;