/**
 * Stream Selector API
 * Handles academic stream selection requests
 */

const express = require('express');
const router = express.Router();
const MCAME = require('../subsystems/mcame');
const { validateStreamResponses } = require('../utils/validation');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const logger = require('../utils/logger');

const mcame = new MCAME();

/**
 * GET /api/stream-selector/questionnaire
 * Get the assessment questionnaire
 */
router.get('/questionnaire', (req, res) => {
  try {
    const questionnaire = mcame.getQuestionnaire();
    res.json({
      success: true,
      questionnaire,
      totalQuestions: questionnaire.length
    });
  } catch (error) {
    logger.error('Error fetching questionnaire:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/stream-selector/assess
 * Process stream selection assessment
 */
router.post('/assess', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateStreamResponses(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Run assessment
    const result = await mcame.assessStudent(value);

    // Save result to database
    const assessment = new Assessment({
      studentId: req.body.studentId || 'anonymous',
      assessmentType: 'mcame',
      result,
      metadata: {
        duration: req.body.duration || 0,
        deviceInfo: req.headers['user-agent'],
        llmModel: 'projection_matrix',
        timestamp: new Date()
      },
      qualityScore: result.qualityScore
    });

    await assessment.save();
    logger.info(`Stream assessment completed for student: ${req.body.studentId}`);

    res.json({
      success: true,
      assessment: result,
      savedId: assessment._id
    });
  } catch (error) {
    logger.error('Stream assessment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
