import mongoose from 'mongoose';

const connectDB = async () => {
  // Check if we are already connected to avoid multiple connections
  if (mongoose.connections[0].readyState) {
    console.log('Already connected to MongoDB.');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // In a serverless function, we should throw an error instead of exiting the process
    throw new Error('Failed to connect to MongoDB');
  }
};

export default connectDB;


// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('MongoDB Connected...');
//   } catch (err) {
//     console.error(err.message);
//     // Exit process with failure
//     process.exit(1);
//   }
// };

// module.exports = connectDB;