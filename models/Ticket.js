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
    enum: ['الترجمان', 'قرية الحجاج'],
    required: true,
  },
  fromStation: {
    type: String,
    enum: ['الدولي', 'القبطي'],
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
    type: Number,  // Seat number for the ticket
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
  cancel: {
    type: String,
  }
});


const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
