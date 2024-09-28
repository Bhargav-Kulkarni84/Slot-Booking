const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define User schema
const newUser = new Schema({
    email: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    regno: {
        type: String,
        required: true
    },
    emailSent: {  // field to track email sent status
        type: Boolean,
        default: false
    },
    slot: {  
        type: Schema.Types.ObjectId,
        ref: 'Slot'  // Reference to Slot model
    }
});

// Create User model from the schema
const User = mongoose.model('User', newUser);

module.exports = User;
