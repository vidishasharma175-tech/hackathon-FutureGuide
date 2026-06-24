/**
 * Learning Gap Analyser API
 * Handles learning gap detection and study plan generation
 */

const express = require('express');
const router = express.Router();
const LLGDRC = require('../subsystems/llgdrc');
const { validateLearningGapInput } = require('../utils/validation');
const Assessment = require('../models/Assessment');
const logger = require('../utils/logger');

const llgdrc = new LLGDRC();

/**
 * POST /api/learning-gap/analyze
 * Analyze learning gaps and generate study plan
 */
router.post('/analyze', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateLearningGapInput(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Analyze gaps
    const analysis = await llgdrc.analyzeAndRemediate(
      value.marks,
      value.teacherRemarks || {}
    );

    // Save assessment
    const assessment = new Assessment({
      studentId: req.body.studentId || 'anonymous',
      assessmentType: 'llgdrc',
      result: analysis,
      metadata: {
        timestamp: new Date()
      },
      qualityScore: 0.85
    });

    await assessment.save();
    logger.info(`Learning gap analysis completed`);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error('Learning gap analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
