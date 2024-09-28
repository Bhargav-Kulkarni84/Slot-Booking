// Importing required modules
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
require('dotenv').config();

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Kolkata');

// Importing models
const User = require('./models/user');
const Slot = require('./models/slot');

const app = express();

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(timeStr) {
  let [hour, minute] = timeStr.split(':').map(Number);
  
  // Assume PM if hour is less than 12
  if (hour < 12) {
    hour += 12;
  }
  
  // Handle 12 PM correctly
  if (hour === 24) {
    hour = 12;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Setting up view engine and views directory
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connecting to MongoDB
mongoose.connect('mongodb://localhost:27017/slotBooking')
  .then(() => {
    console.log('DB Connection Successful');
  })
  .catch((e) => {
    console.error('Error Occurred While Connecting To DB:', e);
  });

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
          user: process.env.USER, // Gmail user from .env file
          pass: process.env.APP_PASSWORD, // App password from .env file
        }
});

// Function to send email reminder
async function sendEmailReminder(userEmail, slot) {
    const mailOptions = {
      from: {
                name: 'Bhargav',
                address: process.env.USER,
              },
        to: userEmail,
        subject: 'Slot Booking Reminder',
        text: `This is a reminder that you have a slot booked for Slot Number: ${slot.slot_number} at ${slot.start_time}.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Cron job to send email reminders 10 minutes before the slot starts
cron.schedule('* * * * *', async () => {
  const now = dayjs(); // Current time in Asia/Kolkata
  console.log("=== Cron Job Triggered ===");
  console.log("Current time:", now.format());

  try {
    const users = await User.find().populate('slot');

    for (const user of users) {
      const slot = user.slot;

      if (slot && slot.slot_isBooked) {
        // Combine slot_date and start_time correctly
        const slotDate = dayjs(slot.slot_date).tz('Asia/Kolkata').format('YYYY-MM-DD');
        const slotStartTimeStr = convertTo24Hour(slot.start_time); // Convert to 24-hour format
        const slotStartTimeIST = dayjs.tz(`${slotDate} ${slotStartTimeStr}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');

        console.log(`User: ${user.name}`);
        console.log(`Slot Start Time (IST): ${slotStartTimeIST.format()}`);
        console.log(`Now (IST): ${now.format()}`);

        // Calculate the difference in milliseconds
        const diffInMillis = slotStartTimeIST.diff(now, 'millisecond');

        // Check if the slot starts within the next 10 minutes and email hasn't been sent
        if (slotStartTimeIST.isAfter(now) && diffInMillis <= 600000 && !user.emailSent) {
          console.log(`Sending email to ${user.email} for slot ${slot.slot_number} starting at ${slot.start_time}`);

          await sendEmailReminder(user.email, slot);
          user.emailSent = true;  // Mark email as sent
          await user.save(); // Save the updated user document

          console.log(`Email sent and user document updated for ${user.email}`);
        } else {
          console.log(`No email sent for ${user.email}. Condition not met.`);
        }
      } else {
        console.log(`No booked slot found for user: ${user.name}`);
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }

  console.log("=== Cron Job Completed ===\n");
});

// Test Email Route
app.get('/test-email', async (req, res) => {
  const id = '66f7d04ade5fc9a90316db8b'; // Replace with a valid Slot ID from your DB
  const slot = await Slot.findById(id);
  if (slot) {
    await sendEmailReminder('bhargavkulkarni8421@gmail.com', slot); 
    res.send('Test email sent!');
  } else {
    res.send('Slot not found!');
  }
});

/* ----------------------------- User Routes ----------------------------- */

// Show all users
app.get('/home', async (req, res) => {
  res.render('users/home');
});

app.get('/users', async (req, res) => {
  const users = await User.find({});
  res.render('users/userdetails', { users });
});

// Show all available slots for booking
app.get('/book', async (req, res) => {
  const slots = await Slot.find({});
  res.render('users/bookslot', { slots });
});

// Show booking form for a specific slot
app.get('/book/slot/:id', async (req, res) => {
  const { id } = req.params;
  const slot = await Slot.findById(id);
  res.render('users/newbooking', { slot });
});

// Show user's booking info
app.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate('slot');
  res.render('users/userslotsinfo', { user });
});

// Create a new booking for a user
app.post('/book', async (req, res) => {
  const { email, number, name, regno, slot_id } = req.body;

  const slot = await Slot.findById(slot_id);
  if (!slot) {
    return res.status(404).send('Slot not found!');
  }
  if (slot.available_seats <= 0) {
    return res.status(400).send('No available seats for this slot.');
  }

  const saveUser = new User({ email, number, name, regno, slot: slot_id });
  slot.slot_isBooked = true;
  slot.available_seats -= 1;

  await saveUser.save();
  await slot.save();
  res.redirect('/users');
});

/* ---------------------------- Admin Routes ----------------------------- */

// Show all slots (admin view)
app.get('/admin', async (req, res) => {
  res.render('admins/adminindex');
});

app.get('/admin/slotindex', async (req, res) => {
  const slots = await Slot.find({});
  res.render('admins/slotindex', { slots });
});

// Show form to add a new slot
app.get('/admin/addslot', (req, res) => {
  res.render('admins/addslot');
});

// Show specific slot details (admin view)
app.get('/admin/slot/:id', async (req, res) => {
  const { id } = req.params;
  const slot = await Slot.findById(id);
  res.render('admins/showslot', { slot });
});

// Show form to edit a slot (admin view)
app.get('/admin/slot/:id/edit', async (req, res) => {
  const { id } = req.params;
  const slot = await Slot.findById(id);
  res.render('admins/editslot', { slot });
});

// Add a new slot (admin action)
app.post('/addslot', async (req, res) => {
  const addslot = new Slot(req.body);
  await addslot.save();
  res.redirect('/admin/slotindex');
});

// Update slot details (admin action)
app.put('/slot/:id/edit', async (req, res) => {
  const { id } = req.params;
  await Slot.findByIdAndUpdate(id, req.body);
  res.redirect(`/admin/slot/${id}`);
});

// Delete a slot (admin action)
app.delete('/slot/:id/delete', async (req, res) => {
  const { id } = req.params;
  await Slot.findByIdAndDelete(id);
  res.redirect('/admin/slotindex');
});

/* ------------------------- Server Initialization ------------------------ */

app.listen(3000, () => {
  console.log("Listening on Port 3000");
});
