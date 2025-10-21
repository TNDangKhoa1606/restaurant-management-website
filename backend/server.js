require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});