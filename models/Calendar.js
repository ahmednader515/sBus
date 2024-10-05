const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const calendarSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Calendar = mongoose.model('Calendar', calendarSchema);
module.exports = Calendar;