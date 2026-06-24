/**
 * Projection Matrix Module
 * Manages the 8x3 projection matrix for MCAME
 */

const logger = require('../../utils/logger');

/**
 * Initialize projection matrix with calibrated weights
 * @returns {Array<Array<number>>} 8x3 projection matrix
 */
function initializeProjectionMatrix() {
  // Calibrated 8x3 projection matrix
  // Rows: 8 psychometric dimensions
  // Columns: 3 streams (Science, Commerce, Arts)
  return [
    [0.85, 0.10, 0.05],  // D1: Preferred activity type
    [0.80, 0.15, 0.05],  // D2: Group-work role orientation
    [0.75, 0.15, 0.10],  // D3: Favourite subject cluster
    [0.88, 0.08, 0.04],  // D4: Problem-solving style
    [0.70, 0.20, 0.10],  // D5: Career domain aspiration
    [0.60, 0.25, 0.15],  // D6: Extracurricular engagement
    [0.65, 0.20, 0.15],  // D7: Personality archetype
    [0.75, 0.15, 0.10]   // D8: Preferred exam modality
  ];
}

/**
 * Load or initialize projection matrix
 * @param {string} modelPath - Path to saved model (optional)
 * @returns {Object} Projection matrix wrapper
 */
function loadOrInitialize(modelPath) {
  let matrix = initializeProjectionMatrix();

  return {
    /**
     * Get current matrix
     * @returns {Array<Array<number>>}
     */
    getMatrix() {
      return matrix;
    },

    /**
     * Set matrix (used for federated learning updates)
     * @param {Array<Array<number>>} newMatrix
     */
    setMatrix(newMatrix) {
      if (newMatrix.length === 8 && newMatrix[0].length === 3) {
        matrix = newMatrix;
        logger.info('Projection matrix updated');
      } else {
        throw new Error('Invalid matrix dimensions. Expected 8x3.');
      }
    },

    /**
     * Get matrix element
     * @param {number} row
     * @param {number} col
     * @returns {number}
     */
    get(row, col) {
      return matrix[row][col];
    },

    /**
     * Calculate gradient for federated learning
     * @param {Array<number>} responses
     * @param {Array<number>} targetVector
     * @returns {Array<Array<number>>} Gradient matrix
     */
    calculateGradient(responses, targetVector) {
      const gradient = [];
      for (let i = 0; i < 8; i++) {
        gradient[i] = [];
        for (let j = 0; j < 3; j++) {
          const prediction = matrix.reduce((sum, row, k) => 
            sum + (k === i ? responses[k] * matrix[k][j] : 0), 0
          );
          gradient[i][j] = responses[i] * (prediction - targetVector[j]);
        }
      }
      return gradient;
    }
  };
}

module.exports = {
  initializeProjectionMatrix,
  loadOrInitialize
};
