/**
 * College Finder API
 * Handles institutional matching requests
 */

const express = require('express');
const router = express.Router();
const APBCIME = require('../subsystems/apbcime');
const { validateCollegeInput } = require('../utils/validation');
const Assessment = require('../models/Assessment');
const logger = require('../utils/logger');

const apbcime = new APBCIME();

// Mock institutions database
const MOCK_INSTITUTIONS = [
  {
    name: 'Indian Institute of Technology Delhi',
    cutoff: 95,
    annualFee: 180000,
    city: 'Delhi',
    courses: ['Computer Science', 'Electronics', 'Mechanical Engineering'],
    placementRate: 0.985
  },
  {
    name: 'Delhi University - College of Arts',
    cutoff: 85,
    annualFee: 50000,
    city: 'Delhi',
    courses: ['History', 'Political Science', 'Economics'],
    placementRate: 0.75
  },
  {
    name: 'Delhi Institute of Commerce',
    cutoff: 80,
    annualFee: 120000,
    city: 'Delhi',
    courses: ['Accountancy', 'Business Studies', 'Economics'],
    placementRate: 0.88
  },
  {
    name: 'Mumbai Institute of Technology',
    cutoff: 93,
    annualFee: 200000,
    city: 'Mumbai',
    courses: ['Computer Science', 'IT', 'Civil Engineering'],
    placementRate: 0.92
  },
  {
    name: 'Bangalore Engineering College',
    cutoff: 88,
    annualFee: 150000,
    city: 'Bangalore',
    courses: ['Computer Science', 'Electrical Engineering'],
    placementRate: 0.90
  }
];

/**
 * POST /api/college-finder/match
 * Find matching institutions for student
 */
router.post('/match', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateCollegeInput(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Find matches
    const matches = await apbcime.findMatches(value, MOCK_INSTITUTIONS);

    // Save assessment
    const assessment = new Assessment({
      studentId: req.body.studentId || 'anonymous',
      assessmentType: 'apbcime',
      result: { matches },
      metadata: {
        timestamp: new Date()
      },
      qualityScore: 0.87
    });

    await assessment.save();
    logger.info(`College matching completed for student`);

    res.json({
      success: true,
      matches,
      totalMatches: MOCK_INSTITUTIONS.length,
      bestMatches: matches.length
    });
  } catch (error) {
    logger.error('College matching error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
