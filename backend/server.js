require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const flightsRoutes = require('./routes/flights');
const educationRoutes = require('./routes/education');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Trust Railway proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});

// CORS configuration
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/education', educationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CabinCalm API is running' });
});

app.listen(PORT, () => {
  console.log(`CabinCalm server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);
});

module.exports = app;
