/**
 * Stream Classifier Module
 * Determines academic stream from psychometric responses
 */

const streams = {
  science: {
    name: 'Science',
    index: 0,
    careerPaths: [
      'Software Engineer',
      'Data Scientist',
      'Mechanical Engineer',
      'Medical Doctor',
      'Research Scientist',
      'Biotechnologist',
      'Civil Engineer'
    ],
    coreSubjects: ['Physics', 'Chemistry', 'Biology/Mathematics', 'Computer Science'],
    description: 'Science stream focuses on analytical thinking, problem-solving, and technical skills.'
  },
  commerce: {
    name: 'Commerce',
    index: 1,
    careerPaths: [
      'Chartered Accountant',
      'Business Analyst',
      'Investment Banker',
      'Corporate Manager',
      'Marketing Executive',
      'Financial Advisor',
      'Entrepreneur'
    ],
    coreSubjects: ['Accountancy', 'Business Studies', 'Economics', 'English'],
    description: 'Commerce stream develops skills in business, finance, and management.'
  },
  arts: {
    name: 'Arts',
    index: 2,
    careerPaths: [
      'Journalist',
      'Lawyer',
      'Diplomat',
      'Psychologist',
      'Social Worker',
      'Civil Servant',
      'Author'
    ],
    coreSubjects: ['History', 'Geography', 'Political Science', 'English'],
    description: 'Arts stream enhances communication, critical thinking, and cultural understanding.'
  }
};

/**
 * Determine stream from confidence scores
 * @param {Array<number>} confidenceScores - [science, commerce, arts]
 * @returns {Object} Stream information
 */
function determineStream(confidenceScores) {
  const maxIndex = confidenceScores.indexOf(Math.max(...confidenceScores));
  const streamNames = ['science', 'commerce', 'arts'];
  return streams[streamNames[maxIndex]];
}

/**
 * Get stream by name
 * @param {string} streamName
 * @returns {Object} Stream information
 */
function getStreamInfo(streamName) {
  const key = streamName.toLowerCase();
  return streams[key] || null;
}

/**
 * Get all streams
 * @returns {Object} All streams
 */
function getAllStreams() {
  return streams;
}

module.exports = {
  determineStream,
  getStreamInfo,
  getAllStreams
};
