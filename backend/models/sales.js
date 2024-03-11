const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalesSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'rental' or 'sale'
        enum: ['rental', 'sale'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    squareFeet: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    agent: {
        name: {
            type: String,
            required: true
        },
        contact: {
            type: String
        }
    },
    images: [{
        url: String,
        filename: String,

    }]
});

const Room = mongoose.model('Room', SalesSchema);

module.exports = Room;
