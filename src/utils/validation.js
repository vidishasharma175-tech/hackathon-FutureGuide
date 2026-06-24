/**
 * Input Validation Utilities
 * Validates student assessments and data
 */

const Joi = require('joi');

/**
 * Validate stream selector responses
 * @param {Object} data - Response data
 * @returns {Object} - Validation result
 */
function validateStreamResponses(data) {
  const schema = Joi.object({
    dimension1: Joi.string().required().messages({
      'any.required': 'Preferred activity type is required'
    }),
    dimension2: Joi.string().required().messages({
      'any.required': 'Group-work role orientation is required'
    }),
    dimension3: Joi.string().required().messages({
      'any.required': 'Favourite subject cluster is required'
    }),
    dimension4: Joi.string().required().messages({
      'any.required': 'Problem-solving cognitive style is required'
    }),
    dimension5: Joi.string().required().messages({
      'any.required': 'Career domain aspiration is required'
    }),
    dimension6: Joi.string().required().messages({
      'any.required': 'Extracurricular engagement is required'
    }),
    dimension7: Joi.string().required().messages({
      'any.required': 'Personality archetype is required'
    }),
    dimension8: Joi.string().required().messages({
      'any.required': 'Preferred exam modality is required'
    })
  });

  return schema.validate(data);
}

/**
 * Validate college finder input
 * @param {Object} data - Student profile data
 * @returns {Object} - Validation result
 */
function validateCollegeInput(data) {
  const schema = Joi.object({
    studentMarks: Joi.number().min(0).max(100).required(),
    budgetLimit: Joi.number().min(0).required(),
    city: Joi.string().required(),
    courseInterest: Joi.string().required(),
    tolerance: Joi.number().optional().default(5)
  });

  return schema.validate(data);
}

/**
 * Validate career assessment input
 * @param {Object} data - Assessment data
 * @returns {Object} - Validation result
 */
function validateCareerInput(data) {
  const schema = Joi.object({
    generalResponses: Joi.array().length(5).required(),
    targetRole: Joi.string().required()
  });

  return schema.validate(data);
}

/**
 * Validate learning gap input
 * @param {Object} data - Student marks and remarks
 * @returns {Object} - Validation result
 */
function validateLearningGapInput(data) {
  const schema = Joi.object({
    marks: Joi.object().required(),
    teacherRemarks: Joi.object().optional()
  });

  return schema.validate(data);
}

module.exports = {
  validateStreamResponses,
  validateCollegeInput,
  validateCareerInput,
  validateLearningGapInput
};
