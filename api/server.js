// api/server.js
import express from 'express';
import serverless from 'serverless-http';
import connectDB from '../../lib/config/db.js';

// Import routes
import authRoutes from '../../lib/routes/authRoutes.js';
import courseRoutes from '../../lib/routes/courseRoutes.js';
import userRoutes from '../../lib/routes/userRoutes.js';

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);

// Default route for testing
app.get('/', (req, res) => res.send('API is running'));

// Export as serverless function
export default serverless(app);




// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('../lib/config/db');

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// // Connect Auth Routes
// app.use('/api/auth', require('./routes/authRoutes'));

// // Connect Course Routes
// app.use('/api/courses', require('./routes/courseRoutes'));

// // Connect User Routes
// app.use('/api/users', require('./routes/userRoutes'));

// const PORT = process.env.PORT || 5000;
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", message: "Backend is running 🚀" });
// });
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));