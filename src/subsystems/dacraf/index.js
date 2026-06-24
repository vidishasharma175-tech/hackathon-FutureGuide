/**
 * DACRAF - Dual-Stage Adaptive Career Readiness Assessment Framework
 * 
 * Administers two-stage career assessment with role-specific question generation
 */

const { callLLM } = require('../../config/llm');
const logger = require('../../utils/logger');

class DACRAF {
  constructor() {
    this.stage1Weight = 0.40;
    this.stage2Weight = 0.60;
  }

  /**
   * Administer full assessment
   * @param {Object} responses - Stage 1 responses
   * @param {Array} stage2Responses - Stage 2 responses
   * @param {string} targetRole - Target job role
   * @returns {Promise<Object>} Assessment result
   */
  async assessCareerReadiness(responses, stage2Responses, targetRole) {
    try {
      logger.info(`Assessing career readiness for role: ${targetRole}`);

      // Stage 1: General aptitude battery
      const generalProfile = this._scoreStage1(responses);

      // Stage 2: Role-specific assessment
      const roleProfile = this._scoreStage2(stage2Responses);

      // Composite score
      const readinessScore = (this.stage1Weight * generalProfile) + (this.stage2Weight * roleProfile);

      // Determine readiness level
      let readinessLevel;
      if (readinessScore >= 0.80) {
        readinessLevel = 'Job Ready';
      } else if (readinessScore >= 0.60) {
        readinessLevel = 'Nearly Ready';
      } else {
        readinessLevel = 'Needs Work';
      }

      return {
        readinessScore: parseFloat(readinessScore.toFixed(3)),
        readinessLevel,
        generalProfile: parseFloat(generalProfile.toFixed(3)),
        roleSpecificProfile: parseFloat(roleProfile.toFixed(3)),
        targetRole,
        skillAssessment: this._assessSkills(responses),
        skillGaps: this._identifySkillGaps(responses, targetRole),
        jobRecommendations: await this._generateJobRecommendations(targetRole, readinessScore),
        nextSteps: this._generateNextSteps(readinessLevel),
        assessmentTimestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('DACRAF assessment error:', error);
      throw error;
    }
  }

  /**
   * Score Stage 1 general battery
   * @private
   */
  _scoreStage1(responses) {
    if (!responses || responses.length === 0) return 0;
    return responses.reduce((sum, score) => sum + score, 0) / responses.length;
  }

  /**
   * Score Stage 2 role-specific assessment
   * @private
   */
  _scoreStage2(responses) {
    if (!responses || responses.length === 0) return 0;
    return responses.reduce((sum, score) => sum + score, 0) / responses.length;
  }

  /**
   * Assess individual skills
   * @private
   */
  _assessSkills(responses) {
    return {
      technical: {
        score: (responses[0] || 0),
        level: this._scoreToLevel(responses[0])
      },
      communication: {
        score: (responses[1] || 0),
        level: this._scoreToLevel(responses[1])
      },
      leadership: {
        score: (responses[2] || 0),
        level: this._scoreToLevel(responses[2])
      },
      problemSolving: {
        score: (responses[3] || 0),
        level: this._scoreToLevel(responses[3])
      },
      adaptability: {
        score: (responses[4] || 0),
        level: this._scoreToLevel(responses[4])
      }
    };
  }

  /**
   * Convert score to level
   * @private
   */
  _scoreToLevel(score) {
    if (score >= 0.8) return 'Strong';
    if (score >= 0.6) return 'Moderate';
    if (score >= 0.4) return 'Developing';
    return 'Needs Development';
  }

  /**
   * Identify skill gaps
   * @private
   */
  _identifySkillGaps(responses, targetRole) {
    const gaps = [];
    if (responses[0] < 0.7) gaps.push('Technical skills - Consider pursuing relevant certifications');
    if (responses[1] < 0.7) gaps.push('Communication skills - Practice presentation and writing');
    if (responses[2] < 0.7) gaps.push('Leadership skills - Seek leadership opportunities');
    if (responses[3] < 0.7) gaps.push('Problem-solving - Work on analytical thinking exercises');
    if (responses[4] < 0.7) gaps.push('Adaptability - Embrace diverse work environments');
    return gaps;
  }

  /**
   * Generate job recommendations
   * @private
   */
  async _generateJobRecommendations(targetRole, readinessScore) {
    const jobRecommendations = [
      {
        rank: 1,
        title: `${targetRole} (Entry-Level)`,
        matchScore: readinessScore
      },
      {
        rank: 2,
        title: `${targetRole} Trainee`,
        matchScore: readinessScore * 0.95
      },
      {
        rank: 3,
        title: 'Related Role',
        matchScore: readinessScore * 0.85
      },
      {
        rank: 4,
        title: 'Internship Opportunity',
        matchScore: readinessScore * 0.90
      }
    ];
    return jobRecommendations;
  }

  /**
   * Generate next steps based on readiness level
   * @private
   */
  _generateNextSteps(readinessLevel) {
    const steps = {
      'Job Ready': [
        'Start applying to relevant job positions',
        'Prepare for interviews with mock practice',
        'Build a strong portfolio showcasing your projects',
        'Network with professionals in your field'
      ],
      'Nearly Ready': [
        'Complete additional skill-building courses',
        'Work on a capstone project',
        'Seek internship opportunities',
        'Build professional network'
      ],
      'Needs Work': [
        'Enroll in foundational skill-building programs',
        'Focus on core competency development',
        'Seek mentorship from experienced professionals',
        'Plan for a structured learning path'
      ]
    };
    return steps[readinessLevel] || [];
  }
}

module.exports = DACRAF;
