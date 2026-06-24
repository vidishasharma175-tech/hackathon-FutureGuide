/**
 * Student Model
 * Stores student profile and assessment data
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ['10', '12'],
    required: true
  },
  school: String,
  city: String,
  marks: {
    type: Map,
    of: Number
  },
  budget: Number,
  preferences: {
    stream: String,
    courseInterest: String,
    geographicPreference: String
  },
  assessments: {
    mcame: mongoose.Schema.Types.Mixed,
    apbcime: mongoose.Schema.Types.Mixed,
    dacraf: mongoose.Schema.Types.Mixed,
    llgdrc: mongoose.Schema.Types.Mixed
  },
  privacyLevel: {
    type: String,
    enum: ['federated', 'anonymized', 'encrypted'],
    default: 'federated'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
