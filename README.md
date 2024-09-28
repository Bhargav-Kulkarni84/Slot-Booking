# Slot Booking System

## Overview
The Slot Booking System is a web application designed to facilitate the booking of scheduled time slots for users. It collects user details and allows them to book slots based on administrator-defined timelines. The system also features automated email reminders sent to users 10 minutes prior to their scheduled slots.

## Features
- **User Information Collection:** 
  - Collects user details including email, phone number, name, and registration number.
  
- **Slot Scheduling:**
  - Users can book available time slots defined by the administrator.
  - Duration constraints can be set for each slot by the administrator.

- **Automated Reminder System:**
  - Sends an automated email reminder to users 10 minutes before their scheduled slot.

- **Administrator Interface:**
  - Allows administrators to manage and define available slots and duration constraints.

- **Database Integration:**
  - User details and slot bookings are securely stored in a database.

- **User-Friendly Interface:**
  - Provides a simple and intuitive interface for users to book slots and receive confirmations.

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript (or a framework like React, Vue, etc.)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB 

## Limitations
The current implementation of the Slot Booking System does not have the following features:
- **Client and Server-Side Data Validation**
- **Error Handling**
- **Cloud Database Integration**
- **Flexibility for Users to Modify Their Respective Slots**

## ChatGPT Assistance
ChatGPT was utilized in the following areas of the project:
1. **Nodemailer and Cron Integration**: For setting up automated email reminders to users 10 minutes before their scheduled slot.
2. **Styling**: Assistance with front-end styling for a user-friendly interface.
