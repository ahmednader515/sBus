const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  notice: String,
  time: String,
  date: {
    type: String,
    required: true
  },
  calendar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Calendar',
    required: true
  },
  driverName: {
    type: String,
  },
  driverPhoneNumber: {
    type: String,
  },
  busPlateNumber: {
    type: String,
  },
  busPhoneNumber: {
    type: String,
  },
  type: {
    type: String,
    enum: ['ذهاب', 'عودة'],
    required: true
  }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
