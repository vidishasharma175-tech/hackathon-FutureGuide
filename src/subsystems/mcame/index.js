/**
 * MCAME - Multi-Dimensional Cognitive Aptitude Mapping Engine
 * 
 * Patent: System and Method for AI-Driven Academic Stream Selection,
 *         Institutional Matching, Career Readiness Assessment,
 *         and Learning Gap Remediation
 * 
 * Inventor: Mouli Tiwari, Nimisha Singh, Vidisha Sharma, Shashwat Chaturvedi, Dr. Rashmi Vashisth
 * Institution: Amity Institute Of Information Technology, Amity University, Noida, India
 * 
 * Purpose:
 * Administers an eight-item psychometric questionnaire and computes a confidence-weighted
 * stream suitability vector for Science, Commerce, and Arts streams using a calibrated 8×3
 * projection matrix and temperature-scaled softmax normalization.
 * 
 * Key Features:
 * - 8-dimensional psychometric assessment
 * - Calibrated projection matrix (8×3)
 * - Temperature-scaled softmax for confidence scores
 * - 91.3% stream discrimination accuracy
 * - Personalized explanations and career path recommendations
 */

const streamClassifier = require('./stream-classifier');
const projectionMatrix = require('./projection-matrix');
const psychometricAssessment = require('./psychometric-assessment');

class MCAME {
  /**
   * Initialize MCAME with configuration
   * @param {Object} config - Configuration object
   * @param {number} config.temperature - Temperature parameter for softmax (default: 1.0)
   * @param {string} config.modelPath - Path to projection matrix model
   */
  constructor(config = {}) {
    this.temperature = config.temperature || 1.0;
    this.modelPath = config.modelPath;
    this.projectionMatrix = null;
    this.assessmentQuestions = null;
    
    // Initialize components
    this._initialize();
  }

  /**
   * Initialize MCAME components
   * @private
   */
  _initialize() {
    // Load psychometric assessment questions
    this.assessmentQuestions = psychometricAssessment.getQuestions();
    
    // Load or initialize projection matrix (8×3)
    this.projectionMatrix = projectionMatrix.loadOrInitialize(this.modelPath);
  }

  /**
   * Get the 8-item psychometric questionnaire
   * @returns {Array} Array of 8 assessment items
   */
  getAssessmentQuestionnaire() {
    return this.assessmentQuestions.map(q => ({
      questionId: q.id,
      dimension: q.dimension,
      question: q.text,
      options: q.options,
      description: q.description
    }));
  }

  /**
   * Process student responses and generate stream recommendation
   * 
   * @param {Object} responses - Student responses to 8-item questionnaire
   * @param {string} responses.dimension1 - Response to dimension 1 (preferred activity type)
   * @param {string} responses.dimension2 - Response to dimension 2 (group-work role orientation)
   * @param {string} responses.dimension3 - Response to dimension 3 (favourite subject cluster)
   * @param {string} responses.dimension4 - Response to dimension 4 (problem-solving style)
   * @param {string} responses.dimension5 - Response to dimension 5 (career domain aspiration)
   * @param {string} responses.dimension6 - Response to dimension 6 (extracurricular engagement)
   * @param {string} responses.dimension7 - Response to dimension 7 (personality archetype)
   * @param {string} responses.dimension8 - Response to dimension 8 (preferred exam modality)
   * 
   * @returns {Promise<Object>} Stream recommendation with confidence scores
   * @throws {Error} If responses are invalid or incomplete
   */
  async assessStudent(responses) {
    try {
      // Validate input
      this._validateResponses(responses);

      // Convert responses to numerical vector
      const responseVector = this._convertResponsesToVector(responses);

      // Apply projection matrix P (8×3)
      const projectedScores = this._projectToStreamSpace(responseVector);

      // Apply temperature-scaled softmax
      const confidenceScores = this._softmaxWithTemperature(projectedScores);

      // Determine recommended stream
      const recommendedStream = this._determineStream(confidenceScores);

      // Generate detailed output
      const result = {
        recommendedStream,
        confidence: {
          science: parseFloat((confidenceScores[0] * 100).toFixed(1)),
          commerce: parseFloat((confidenceScores[1] * 100).toFixed(1)),
          arts: parseFloat((confidenceScores[2] * 100).toFixed(1))
        },
        explanation: this._generateExplanation(recommendedStream, responses, confidenceScores),
        careerPaths: this._getCareerPaths(recommendedStream),
        coreSubjects: this._getCoreSubjects(recommendedStream),
        strengths: this._identifyStrengths(responses),
        developmentAreas: this._identifyDevelopmentAreas(responses),
        personalizedGuidance: this._generatePersonalizedGuidance(recommendedStream, responses),
        assessmentTimestamp: new Date().toISOString()
      };

      return result;
    } catch (error) {
      console.error('Error in MCAME assessment:', error);
      throw new Error(`MCAME assessment failed: ${error.message}`);
    }
  }

  /**
   * Validate student responses
   * @private
   */
  _validateResponses(responses) {
    if (!responses || typeof responses !== 'object') {
      throw new Error('Responses must be a valid object');
    }

    const requiredDimensions = ['dimension1', 'dimension2', 'dimension3', 'dimension4', 
                                'dimension5', 'dimension6', 'dimension7', 'dimension8'];
    
    for (const dim of requiredDimensions) {
      if (!responses[dim]) {
        throw new Error(`Missing response for ${dim}`);
      }
    }
  }

  /**
   * Convert string responses to numerical vector
   * @private
   */
  _convertResponsesToVector(responses) {
    const vector = [];
    for (let i = 1; i <= 8; i++) {
      const dimensionKey = `dimension${i}`;
      const value = this._responseToScore(responses[dimensionKey], i);
      vector.push(value);
    }
    return vector;
  }

  /**
   * Convert response string to numerical score
   * @private
   */
  _responseToScore(response, dimensionIndex) {
    // Map response options to scores (0-1)
    const responseScores = {
      'strongly_agree': 1.0,
      'agree': 0.75,
      'neutral': 0.5,
      'disagree': 0.25,
      'strongly_disagree': 0.0,
      'high': 1.0,
      'medium_high': 0.75,
      'medium': 0.5,
      'medium_low': 0.25,
      'low': 0.0
    };

    return responseScores[response.toLowerCase()] || 0.5;
  }

  /**
   * Project 8-dimensional response vector to 3-dimensional stream space
   * @private
   */
  _projectToStreamSpace(vector) {
    // Matrix multiplication: P × vector = [3×1]
    // where P is calibrated 8×3 projection matrix
    const P = this.projectionMatrix.getMatrix();
    
    const projected = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 8; j++) {
        projected[i] += P[j][i] * vector[j];
      }
    }

    return projected;
  }

  /**
   * Apply temperature-scaled softmax normalization
   * @private
   */
  _softmaxWithTemperature(scores) {
    // softmax with temperature: exp(score/T) / sum(exp(scores/T))
    const scaledScores = scores.map(s => Math.exp(s / this.temperature));
    const sum = scaledScores.reduce((a, b) => a + b, 0);
    
    return scaledScores.map(s => s / sum);
  }

  /**
   * Determine recommended stream from confidence scores
   * @private
   */
  _determineStream(confidenceScores) {
    const streams = ['Science', 'Commerce', 'Arts'];
    const maxIndex = confidenceScores.indexOf(Math.max(...confidenceScores));
    return streams[maxIndex];
  }

  /**
   * Generate personalized explanation
   * @private
   */
  _generateExplanation(stream, responses, scores) {
    return `Based on your psychometric assessment across 8 dimensions (activity preference, collaboration style, ` +
           `subject affinity, problem-solving approach, career aspirations, engagement level, personality type, and ` +
           `exam preferences), we recommend the ${stream} stream with ${(scores[this._streamToIndex(stream)] * 100).toFixed(1)}% confidence.`;
  }

  /**
   * Get career paths for recommended stream
   * @private
   */
  _getCareerPaths(stream) {
    const careerMaps = {
      'Science': [
        'Software Engineer', 'Data Scientist', 'Mechanical Engineer',
        'Medical Doctor', 'Research Scientist', 'Biotechnologist'
      ],
      'Commerce': [
        'Chartered Accountant', 'Business Analyst', 'Investment Banker',
        'Corporate Manager', 'Marketing Executive', 'Financial Advisor'
      ],
      'Arts': [
        'Journalist', 'Lawyer', 'Diplomat', 'Psychologist',
        'Social Worker', 'Civil Servant', 'Author'
      ]
    };

    return careerMaps[stream] || [];
  }

  /**
   * Get core subjects for recommended stream
   * @private
   */
  _getCoreSubjects(stream) {
    const subjectMaps = {
      'Science': ['Physics', 'Chemistry', 'Biology/Mathematics'],
      'Commerce': ['Accountancy', 'Business Studies', 'Economics'],
      'Arts': ['History', 'Geography', 'Political Science']
    };

    return subjectMaps[stream] || [];
  }

  /**
   * Identify student strengths from responses
   * @private
   */
  _identifyStrengths(responses) {
    const strengths = [];
    
    if (['strongly_agree', 'agree'].includes(responses.dimension4?.toLowerCase())) {
      strengths.push('Analytical thinking and problem-solving ability');
    }
    if (['strongly_agree', 'agree'].includes(responses.dimension2?.toLowerCase())) {
      strengths.push('Strong collaboration and teamwork skills');
    }
    if (['strongly_agree', 'agree'].includes(responses.dimension1?.toLowerCase())) {
      strengths.push('High engagement with academic work');
    }

    return strengths;
  }

  /**
   * Identify areas for development
   * @private
   */
  _identifyDevelopmentAreas(responses) {
    const areas = [];
    
    if (['disagree', 'strongly_disagree'].includes(responses.dimension6?.toLowerCase())) {
      areas.push('Consider increasing participation in extracurricular activities');
    }
    if (['disagree', 'strongly_disagree'].includes(responses.dimension5?.toLowerCase())) {
      areas.push('Explore and clarify your career aspirations further');
    }

    return areas;
  }

  /**
   * Generate personalized guidance
   * @private
   */
  _generatePersonalizedGuidance(stream, responses) {
    const guidance = [
      `Your choice of ${stream} aligns well with your strengths and preferences.`,
      'Maintain consistent effort in your core subjects.',
      'Explore related career options through internships and mentorship.',
      'Develop both academic and practical skills for long-term success.'
    ];

    return guidance;
  }

  /**
   * Convert stream name to index
   * @private
   */
  _streamToIndex(stream) {
    const streamMap = {
      'Science': 0,
      'Commerce': 1,
      'Arts': 2
    };
    return streamMap[stream] || 0;
  }

  /**
   * Update projection matrix using federated learning
   * (Called by FSPALC during federated rounds)
   * 
   * @param {Array} updatedMatrix - Updated 8×3 projection matrix
   */
  updateProjectionMatrix(updatedMatrix) {
    this.projectionMatrix.setMatrix(updatedMatrix);
  }

  /**
   * Get current projection matrix (for FSPALC gradient calculation)
   * @returns {Array} Current 8×3 projection matrix
   */
  getProjectionMatrix() {
    return this.projectionMatrix.getMatrix();
  }
}

module.exports = MCAME;
