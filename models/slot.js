const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define Slot schema
const addSlot = new Schema({
    slot_number: {
        type: Number,
        required: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    slot_duration: {
        type: Number,
        required: true
    },
    slot_isBooked: {
        type: Boolean, 
        default: false,
        required: true
    },   
    slot_users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    slot_date:{
        type:Date
    },
    status: {
        type: String,
    },
    available_seats: {
        type: Number
    }
});

// Create Slot model from the schema
const Slot = mongoose.model('Slot', addSlot);

module.exports = Slot;