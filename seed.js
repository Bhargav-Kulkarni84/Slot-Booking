const mongoose = require('mongoose');
const Slot = require('./models/slot'); // Update this with the correct path to your model

const seedSlots = async () => {
    await mongoose.connect('mongodb://localhost:27017/slotBooking', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const slots = [
        {
            slot_number: 1,
            start_time: "09:00",
            end_time: "10:00",
            slot_duration: 60,
            slot_isBooked: false,
            slot_users: [],
            slot_date: new Date("2024-10-01"),
            status: "Available",
            available_seats: 10
        },
        {
            slot_number: 2,
            start_time: "10:00",
            end_time: "11:00",
            slot_duration: 60,
            slot_isBooked: true,
            slot_users: ["651a6fc934fbb1253f0b8f9a"], // example ObjectId of a user
            slot_date: new Date("2024-10-01"),
            status: "Booked",
            available_seats: 0
        },
        {
            slot_number: 3,
            start_time: "11:00",
            end_time: "12:00",
            slot_duration: 60,
            slot_isBooked: false,
            slot_users: [],
            slot_date: new Date("2024-10-01"),
            status: "Available",
            available_seats: 8
        },
        {
            slot_number: 4,
            start_time: "12:00",
            end_time: "13:00",
            slot_duration: 60,
            slot_isBooked: false,
            slot_users: [],
            slot_date: new Date("2024-10-01"),
            status: "Available",
            available_seats: 5
        },
        {
            slot_number: 5,
            start_time: "13:00",
            end_time: "14:00",
            slot_duration: 60,
            slot_isBooked: true,
            slot_users: ["651a6fc934fbb1253f0b8f9b"], // example ObjectId of another user
            slot_date: new Date("2024-10-01"),
            status: "Booked",
            available_seats: 0
        }
    ];

    await Slot.insertMany(slots);
    console.log('Database seeded successfully with slots data!');
    mongoose.connection.close();
};

seedSlots().catch(err => console.log(err));
