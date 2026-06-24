/**
 * Assessment Model
 * Stores assessment results
 */

const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  assessmentType: {
    type: String,
    enum: ['mcame', 'apbcime', 'dacraf', 'llgdrc'],
    required: true
  },
  result: mongoose.Schema.Types.Mixed,
  metadata: {
    duration: Number,
    deviceInfo: String,
    llmModel: String,
    timestamp: Date
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 1
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
