/**
 * LLM Configuration Module
 * Handles OpenAI API configuration and helper functions
 */

const { Configuration, OpenAIApi } = require('openai');
const logger = require('../utils/logger');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

/**
 * Call OpenAI API for chat completion
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - API response
 */
async function callLLM(messages, options = {}) {
  try {
    const response = await openai.createChatCompletion({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages,
      temperature: options.temperature || parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      max_tokens: options.maxTokens || 1000,
      top_p: options.topP || 0.9
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    logger.error('LLM API error:', error);
    throw new Error(`LLM API call failed: ${error.message}`);
  }
}

/**
 * Generate embeddings using OpenAI
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} - Embedding vector
 */
async function getEmbedding(text) {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text
    });

    return response.data.data[0].embedding;
  } catch (error) {
    logger.error('Embedding API error:', error);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vec1 - First vector
 * @param {Array} vec2 - Second vector
 * @returns {number} - Cosine similarity score (0-1)
 */
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
}

module.exports = {
  openai,
  callLLM,
  getEmbedding,
  cosineSimilarity
};
