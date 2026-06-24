/**
 * APBCIME - Academic Profile and Budget-Constrained Institutional Matching Engine
 * 
 * Ranks institutions using a 4-factor composite score with academic and budget filters
 */

const { getEmbedding, cosineSimilarity } = require('../../config/llm');
const logger = require('../../utils/logger');

class APBCIME {
  constructor(config = {}) {
    this.weights = {
      academicFit: 0.40,
      budgetCompat: 0.30,
      geoPreference: 0.20,
      courseAlign: 0.10
    };
    this.tolerance = config.tolerance || 5;
  }

  /**
   * Find institutional matches for student
   * @param {Object} studentProfile - Student profile data
   * @param {Array} institutions - List of institutions
   * @returns {Promise<Array>} Ranked institutions
   */
  async findMatches(studentProfile, institutions) {
    try {
      logger.info(`Finding matches for student with marks: ${studentProfile.studentMarks}`);

      // Stage 1: Academic Eligibility Filter
      let filtered = this._applyAcademicFilter(studentProfile, institutions);
      logger.info(`After academic filter: ${filtered.length} institutions`);

      // Stage 2: Budget Feasibility Filter
      filtered = this._applyBudgetFilter(studentProfile, filtered);
      logger.info(`After budget filter: ${filtered.length} institutions`);

      // Stage 3: Compute composite scores
      const scored = await Promise.all(
        filtered.map(inst => this._computeScore(studentProfile, inst))
      );

      // Sort and return top matches
      return scored
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)
        .map((inst, idx) => ({
          rank: idx + 1,
          ...inst
        }));
    } catch (error) {
      logger.error('APBCIME matching error:', error);
      throw error;
    }
  }

  /**
   * Apply academic eligibility filter
   * @private
   */
  _applyAcademicFilter(profile, institutions) {
    return institutions.filter(inst => {
      const cutoffDiff = inst.cutoff - profile.studentMarks;
      return cutoffDiff <= this.tolerance;
    });
  }

  /**
   * Apply budget feasibility filter
   * @private
   */
  _applyBudgetFilter(profile, institutions) {
    return institutions.filter(inst => inst.annualFee <= profile.budgetLimit);
  }

  /**
   * Compute composite score for institution
   * @private
   */
  async _computeScore(profile, institution) {
    try {
      // Academic fit score
      const academicFit = 1 - Math.abs(profile.studentMarks - institution.cutoff) / 100;

      // Budget compatibility score
      const budgetComp = Math.max(0, 1 - institution.annualFee / profile.budgetLimit);

      // Geographic preference score
      const geoPref = this._calculateGeoPref(profile.city, institution.city);

      // Course alignment score (cosine similarity)
      let courseAlign = 0;
      if (profile.courseInterest && institution.courses) {
        const courseStr = institution.courses.join(', ');
        const studentEmb = await getEmbedding(profile.courseInterest);
        const instEmb = await getEmbedding(courseStr);
        courseAlign = cosineSimilarity(studentEmb, instEmb);
      }

      // Composite score
      const matchScore =
        this.weights.academicFit * academicFit +
        this.weights.budgetCompat * budgetComp +
        this.weights.geoPreference * geoPref +
        this.weights.courseAlign * courseAlign;

      return {
        name: institution.name,
        matchScore: parseFloat(matchScore.toFixed(3)),
        academicFit: parseFloat(academicFit.toFixed(3)),
        budgetCompatibility: parseFloat(budgetComp.toFixed(3)),
        geographicPreference: parseFloat(geoPref.toFixed(3)),
        courseAlignment: parseFloat(courseAlign.toFixed(3)),
        annualFee: institution.annualFee,
        cutoff: institution.cutoff,
        courses: institution.courses,
        placementRate: institution.placementRate,
        aiInsight: this._generateInsight(institution, matchScore)
      };
    } catch (error) {
      logger.error('Error computing score for institution:', error);
      return {
        name: institution.name,
        matchScore: 0,
        error: error.message
      };
    }
  }

  /**
   * Calculate geographic preference score
   * @private
   */
  _calculateGeoPref(studentCity, instCity) {
    if (studentCity.toLowerCase() === instCity.toLowerCase()) {
      return 1.0;
    }
    // Simplified: return 0.5 for same state, 0.3 for different
    return 0.5;
  }

  /**
   * Generate AI insight for institution
   * @private
   */
  _generateInsight(institution, matchScore) {
    if (matchScore >= 0.85) {
      return `Excellent match! ${institution.name} aligns well with your profile in all criteria.`;
    } else if (matchScore >= 0.70) {
      return `Good match. ${institution.name} offers strong academics and reasonable fees.`;
    } else {
      return `Moderate match. ${institution.name} may require extra effort but is affordable.`;
    }
  }
}

module.exports = APBCIME;
