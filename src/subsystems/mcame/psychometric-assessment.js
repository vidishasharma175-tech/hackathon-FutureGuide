/**
 * Psychometric Assessment Questions Module
 * Defines the 8-item questionnaire for MCAME
 */

const questions = [
  {
    id: 1,
    dimension: 'preferred_activity_type',
    text: 'I prefer activities that are:',
    options: [
      'Analytical and logic-based (1)',
      'Social and people-oriented (2)',
      'Creative and expressive (3)',
      'Practical and hands-on (4)'
    ]
  },
  {
    id: 2,
    dimension: 'group_role_orientation',
    text: 'In group work, I naturally assume the role of:',
    options: [
      'Leader or organizer (1)',
      'Collaborator or team player (2)',
      'Creative contributor (3)',
      'Support or facilitator (4)'
    ]
  },
  {
    id: 3,
    dimension: 'subject_cluster',
    text: 'My favorite subjects are mainly in:',
    options: [
      'Mathematics, Physics, Chemistry (1)',
      'Business, Economics, Accounts (2)',
      'History, Geography, Languages (3)',
      'Arts, Music, Literature (4)'
    ]
  },
  {
    id: 4,
    dimension: 'problem_solving_style',
    text: 'When solving problems, I typically:',
    options: [
      'Use systematic analytical approach (1)',
      'Consult with others and seek consensus (2)',
      'Try innovative and unconventional methods (3)',
      'Follow proven procedures and steps (4)'
    ]
  },
  {
    id: 5,
    dimension: 'career_domain',
    text: 'My career aspirations align most with:',
    options: [
      'Technology, Engineering, Research (1)',
      'Business, Finance, Management (2)',
      'Arts, Media, Education (3)',
      'Other fields (4)'
    ]
  },
  {
    id: 6,
    dimension: 'extracurricular_engagement',
    text: 'My involvement in extracurricular activities is:',
    options: [
      'Very high - I lead multiple clubs (1)',
      'High - I actively participate (2)',
      'Moderate - I participate selectively (3)',
      'Low - I focus mainly on academics (4)'
    ]
  },
  {
    id: 7,
    dimension: 'personality_archetype',
    text: 'My personality can best be described as:',
    options: [
      'Analytical and detail-oriented (1)',
      'Ambitious and achievement-focused (2)',
      'Creative and imaginative (3)',
      'Empathetic and supportive (4)'
    ]
  },
  {
    id: 8,
    dimension: 'exam_preference',
    text: 'I perform best in exams that are:',
    options: [
      'Numerical and analytical (1)',
      'Multiple choice and structured (2)',
      'Essay and subjective-based (3)',
      'Project and practical-based (4)'
    ]
  }
];

/**
 * Get all assessment questions
 * @returns {Array} Questions array
 */
function getQuestions() {
  return questions;
}

/**
 * Get question by ID
 * @param {number} id - Question ID
 * @returns {Object} Question object
 */
function getQuestionById(id) {
  return questions.find(q => q.id === id);
}

module.exports = {
  getQuestions,
  getQuestionById
};
