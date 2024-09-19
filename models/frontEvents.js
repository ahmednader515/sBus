const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FrontEventSchema = new Schema({
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
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
  notice: {
    type: String,
  },
});

const FrontEvent = mongoose.model('FrontEvent', FrontEventSchema);
module.exports = FrontEvent;
