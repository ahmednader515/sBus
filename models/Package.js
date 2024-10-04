const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packageSchema = new Schema({
  packageNumber: {
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
  reservedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reservedAt: {
    type: Date,
    default: null,
  },
});

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;