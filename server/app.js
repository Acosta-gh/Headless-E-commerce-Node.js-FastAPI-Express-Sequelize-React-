
const express = require('express');
const cors = require('cors');
const routesV1 = require('@/routes/v1');
const path = require('path');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" directory
const uploadDir = path.resolve(__dirname, './uploads');
app.use('/uploads', express.static(uploadDir));
// Use versioned routes
app.use('/api/v1', routesV1);
// Health check endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Error handling middleware
const errorHandler = require('@/middlewares/errorHandler.middleware');
app.use(errorHandler);

module.exports = app;
