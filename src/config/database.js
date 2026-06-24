/**
 * Database Configuration Module
 * Handles MongoDB connection and setup
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/futureguide',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority'
  }
};

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    await mongoose.connect(dbConfig.uri, dbConfig.options);
    logger.info('MongoDB connected successfully');
    
    // Create indexes
    await createIndexes();
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
}

/**
 * Create database indexes
 * @private
 */
async function createIndexes() {
  try {
    // Create indexes for common queries
    await mongoose.connection.collection('students').createIndex({ studentId: 1 }, { unique: true });
    await mongoose.connection.collection('assessments').createIndex({ studentId: 1, createdAt: -1 });
    await mongoose.connection.collection('recommendations').createIndex({ studentId: 1 });
    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.warn('Could not create indexes:', error.message);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  dbConfig
};
