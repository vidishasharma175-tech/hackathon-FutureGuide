/**
 * Job Matcher API
 * Handles career readiness assessment requests
 */

const express = require('express');
const router = express.Router();
const DACRAF = require('../subsystems/dacraf');
const { validateCareerInput } = require('../utils/validation');
const Assessment = require('../models/Assessment');
const logger = require('../utils/logger');

const dacraf = new DACRAF();

/**
 * POST /api/job-matcher/assess
 * Assess career readiness
 */
router.post('/assess', async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateCareerInput(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Run assessment
    const result = await dacraf.assessCareerReadiness(
      value.generalResponses,
      req.body.stage2Responses || [],
      value.targetRole
    );

    // Save assessment
    const assessment = new Assessment({
      studentId: req.body.studentId || 'anonymous',
      assessmentType: 'dacraf',
      result,
      metadata: {
        timestamp: new Date()
      },
      qualityScore: 0.941
    });

    await assessment.save();
    logger.info(`Career assessment completed for role: ${value.targetRole}`);

    res.json({
      success: true,
      assessment: result
    });
  } catch (error) {
    logger.error('Career assessment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
