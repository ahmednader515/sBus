const { required } = require('joi');
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
    enum: ['First Class', 'VIP', 'economy'],
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  cardType: {
    type: String,
    enum: ['First Class', 'VIP', 'economy']
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
    enum: ['تذكرة كاملة', 'نصف تذكرة', 'حجز مالك', 'حجز مؤقت'],
    required: true,
  },
  previousType: {  // New field to store the previous ticket type
    type: String,
  },
  status: { type: String, default: 'active' }, 
  created_at: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String,
    required: true
  },
  extraPrice: {
    type: Number,
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
  }
});


const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
