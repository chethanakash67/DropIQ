require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/products', productsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DropIQ Product Search API is running',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
========================================
  DropIQ Product Search Server
========================================
  Server: http://localhost:${PORT}
  API: http://localhost:${PORT}/api
  Environment: ${process.env.NODE_ENV || 'development'}
========================================
  `);
});

module.exports = app;
