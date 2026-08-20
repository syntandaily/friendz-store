const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initSchema } = require('./database/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets & admin portal
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'FRIENDZ E-Commerce Backend API',
    timestamp: new Date().toISOString()
  });
});

// Fallback route for SPA / admin if needed
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Initialize database schema and start server
initSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FRIENDZ Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Panel accessible at http://localhost:${PORT}/admin`);
    console.log(`⚡ API Endpoints active at http://localhost:${PORT}/api/products`);
  });
}).catch(err => {
  console.error('Failed to initialize database schema:', err);
});

module.exports = app;
