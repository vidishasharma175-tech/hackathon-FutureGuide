/*
 * FutureGuide - Main Application Entry Point
 * Enhanced to serve a polished frontend from /public
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/database');

// API routers
const streamSelectorRoutes = require('./api/stream-selector');
const collegeFinderRoutes = require('./api/college-finder');
const jobMatcherRoutes = require('./api/job-matcher');
const learningGapRoutes = require('./api/learning-gap-analyser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend from /public
const path = require('path');
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
// Serve index.html for root
app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health + docs
app.get('/health', (req, res) => {
  res.json({ status: 'operational', service: 'FutureGuide', timestamp: new Date().toISOString() });
});
app.get('/api/docs', (req, res) => {
  res.json({ service: 'FutureGuide - AI-Driven Student Guidance System', version: '1.0.0', routes: [
    { name: 'Stream Selector', endpoints: ['GET /api/stream-selector', 'POST /api/stream-selector/assess'] },
    { name: 'College Finder', endpoints: ['GET /api/college-finder', 'POST /api/college-finder/search'] },
    { name: 'Learning Gap', endpoints: ['GET /api/learning-gap-analyser', 'POST /api/learning-gap-analyser/assess'] },
    { name: 'Job Matcher', endpoints: ['GET /api/job-matcher', 'POST /api/job-matcher/search'] }
  ]});
});

// Register API routers
app.use('/api/stream-selector', streamSelectorRoutes);
app.use('/api/college-finder', collegeFinderRoutes);
app.use('/api/job-matcher', jobMatcherRoutes);
app.use('/api/learning-gap-analyser', learningGapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found', availableEndpoints: { health: '/health', docs: '/api/docs' } });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`FutureGuide server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
