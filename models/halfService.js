const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HalfServiceSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Owner'
    },
});

module.exports = mongoose.model('HalfService', HalfServiceSchema);