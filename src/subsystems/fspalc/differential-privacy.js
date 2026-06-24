/**
 * Differential Privacy Module
 * Implements differential privacy for FSPALC
 */

const logger = require('../../utils/logger');

class DifferentialPrivacy {
  constructor() {
    this.epsilon = parseFloat(process.env.DIFFERENTIAL_PRIVACY_EPSILON) || 0.8;
    this.delta = parseFloat(process.env.DIFFERENTIAL_PRIVACY_DELTA) || 0.00001;
    this.clipNorm = parseFloat(process.env.GRADIENT_CLIPPING_NORM) || 1.0;
  }

  /**
   * Calculate noise scale using Gaussian mechanism
   * @returns {number} Noise scale sigma
   */
  calculateNoiseScale() {
    // σ = sqrt(2 * ln(1.25/δ)) * C / ε
    const factor = Math.sqrt(2 * Math.log(1.25 / this.delta));
    return (factor * this.clipNorm) / this.epsilon;
  }

  /**
   * Apply gradient clipping
   * @param {Array} gradient - Gradient vector
   * @returns {Array} Clipped gradient
   */
  clipGradient(gradient) {
    const norm = Math.sqrt(gradient.reduce((sum, g) => sum + g * g, 0));
    
    if (norm <= this.clipNorm) {
      return gradient;
    }

    const scaleFactor = this.clipNorm / norm;
    return gradient.map(g => g * scaleFactor);
  }

  /**
   * Add Gaussian noise for differential privacy
   * @param {Array} gradient - Gradient to add noise to
   * @returns {Array} Noisy gradient
   */
  addNoise(gradient) {
    const sigma = this.calculateNoiseScale();
    
    return gradient.map(g => {
      // Sample from Gaussian distribution N(0, σ²)
      const noise = this._gaussianNoise(0, sigma);
      return g + noise;
    });
  }

  /**
   * Generate Gaussian random variable
   * @private
   */
  _gaussianNoise(mean, std) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * std;
  }

  /**
   * Apply full differential privacy pipeline
   * @param {Array} gradient - Original gradient
   * @returns {Array} Privacy-protected gradient
   */
  protectGradient(gradient) {
    try {
      // Step 1: Clip gradient
      let protected_grad = this.clipGradient(gradient);
      
      // Step 2: Add noise
      protected_grad = this.addNoise(protected_grad);
      
      return protected_grad;
    } catch (error) {
      logger.error('Error protecting gradient:', error);
      throw error;
    }
  }
}

module.exports = DifferentialPrivacy;
