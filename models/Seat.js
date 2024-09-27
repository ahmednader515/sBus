const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seatSchema = new Schema({
  seatNumber: {
    type: Number,
    required: true,
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
  reservationType: {
    type: String,
    enum: ['temporary', 'permanent'],
    default: 'temporary',
  },
  reservedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reservedAt: {
    type: Date,
    default: Date.now,
  },
});

const Seat = mongoose.model('Seat', seatSchema);
module.exports = Seat;