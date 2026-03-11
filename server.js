const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');
const limiter = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Apply rate limiter to all requests
app.use(limiter);

app.get('/', (req, res) => {
  res.send('Welcome to the User Management API');
});

// Mount routers
app.use('/api/users', require('./routes/userRoutes'));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});