require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/db');
const { seedDemoData } = require('./utils/seedData');
const errorHandler = require('./middleware/error');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
app.use(cors({
  origin: '*', // Allow all origins for dev and Netlify/Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static receipt uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// SYSTEM & HEALTH CHECK ENDPOINT
// ============================================
app.get('/api/ping', (req, res) => res.json({ ok: true, msg: 'pong', timestamp: new Date() }));

app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'healthy',
    service: 'SmartTrack AI API Server',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    aiProvider: process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : 'SmartTrack Heuristic AI Engine (Demo Mode)',
    memoryUsage: process.memoryUsage(),
  });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Optional: Serve client build if run in unified production mode
if (process.env.NODE_ENV === 'production' && !process.env.API_ONLY) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// ============================================
// DATABASE & SERVER INITIALIZATION
// ============================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(async () => {
      await seedDemoData();
      app.listen(PORT, () => {
        console.log(`🚀 SmartTrack AI Server running on http://localhost:${PORT}`);
        console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      });
    })
    .catch((err) => {
      console.error('Failed to initialize server:', err.message);
    });
}

module.exports = app;
