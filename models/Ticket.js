const { required, boolean } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  serial: {
    type: Number,
    required: true
  },
  ownerName: {
    type: String,
  },
  ticketFromStation: {
    type: String,
    required: true,
  },
  fromStation: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true
  },
  clientPhoneNumber: {
    type: String,
    required: true
  },
  ticketClass: {
    type: String,
    enum: ['فيرست كلاس', 'في اي بي', 'ايكونومي'],
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  cardType: {
    type: String,
  },
  cardNumber: {
    type: String,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  seatNumber: {
    type: String,  // Seat number for the ticket
    required: true
  },
  type: {
    type: String,
    required: true,
  },
  previousType: {  // New field to store the previous ticket type
    type: String,
  },
  status: { type: String, default: 'غير ملغية' }, 
  created_at: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  extraPrice: {
    type: Number,
    default: null,
  },
  weightType: {
    type:  String,
    enum: ['1', '2', '3']
  },
  cancel: {
    type: String,
  },
  notice: {
    type: String,
    default: 'لا ملاحظات'
  },
  isTransfered: {
    type: Boolean,
    default:  false,
  },
  isSeatChanged: {
    type: Boolean,
    default:  false,
  },
  transferedFrom: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    default: null // Tracks the event the ticket was transferred from
  },
});


const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
