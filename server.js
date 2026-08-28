const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');
const app = express();

// Middleware
app.use(cors()); // Allow frontend to communicate
app.use(express.json()); // Parse incoming JSON data

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profiles', profileRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);


const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);


// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'SmartHire API is running smoothly!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});