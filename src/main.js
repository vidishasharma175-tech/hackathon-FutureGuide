/**
 * FutureGuide - Main Application Entry Point
 * AI-Driven Student Lifecycle Guidance System
 * 
 * Patent: System and Method for AI-Driven Academic Stream Selection,
 *         Institutional Matching, Career Readiness Assessment,
 *         and Learning Gap Remediation
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/database');

// Import API routes
const streamSelectorRoutes = require('./api/stream-selector');
const collegeFinderRoutes = require('./api/college-finder');
const jobMatcherRoutes = require('./api/job-matcher');
const learningGapRoutes = require('./api/learning-gap-analyser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',')
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'FutureGuide',
    timestamp: new Date().toISOString()
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    service: 'FutureGuide - AI-Driven Student Guidance System',
    version: '1.0.0',
    patent: 'System and Method for AI-Driven Academic Stream Selection, Institutional Matching, Career Readiness Assessment, and Learning Gap Remediation',
    modules: [
      {
        name: 'Stream Selector (MCAME)',
        endpoints: [
          'GET /api/stream-selector/questionnaire',
          'POST /api/stream-selector/assess'
        ]
      },
      {
        name: 'College Finder (APBCIME)',
        endpoints: [
          'POST /api/college-finder/match'
        ]
      },
      {
        name: 'Job Matcher (DACRAF)',
        endpoints: [
          'POST /api/job-matcher/assess'
        ]
      },
      {
        name: 'Learning Gap Analyser (LLGDRC)',
        endpoints: [
          'POST /api/learning-gap/analyze'
        ]
      }
    ]
  });
});

// Register API routes
app.use('/api/stream-selector', streamSelectorRoutes);
app.use('/api/college-finder', collegeFinderRoutes);
app.use('/api/job-matcher', jobMatcherRoutes);
app.use('/api/learning-gap', learningGapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      health: 'GET /health',
      docs: 'GET /api/docs'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

/**
 * Start server
 */
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connected');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 FutureGuide server running on port ${PORT}`);
      logger.info(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  try {
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the application
startServer();

module.exports = app;
