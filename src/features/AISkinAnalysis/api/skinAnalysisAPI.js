import { API_ENDPOINTS } from '../constants';

// Use the configured API client from services
let apiClient;

// Dynamic import to avoid circular dependency
const getApiClient = async () => {
  if (!apiClient) {
    const { default: api } = await import('../../../services/api');
    apiClient = api;
  }
  return apiClient;
};

/**
 * Call API to analyze skin from image
 * @param {string} imagePreview - Base64 encoded image or data URL
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeSkinImage = async (imagePreview) => {
  try {
    const api = await getApiClient();
    // AI analysis needs more time for model loading + inference
    const response = await api.post(API_ENDPOINTS.ANALYZE_SKIN, {
      image: imagePreview
    }, {
      timeout: 60000  // 60 seconds for PyTorch model inference
    });

    if (response.data && response.data.error) {
      throw new Error(response.data.error);
    }

    // Map API response to expected format
    return {
      skinType: response.data.skinType,
      confidence: response.data.confidence,
      skinCondition: response.data.skinCondition,
      recommendations: response.data.recommendations,
      detectedCondition: response.data.detectedCondition,
      conditionConfidence: response.data.conditionConfidence,
      analysisType: response.data.analysisType,
      analysisTimestamp: response.data.analysisTimestamp
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get recommendations for skin type
 * @param {string} skinType - Type of skin detected
 * @returns {Promise<Array>} List of recommendations
 */
export const getRecommendations = async (skinType) => {
  try {
    const api = await getApiClient();
    const response = await api.get(`${API_ENDPOINTS.ANALYZE_SKIN}/recommendations`, {
      params: { skinType }
    });

    return response.data.recommendations || [];
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return [];
  }
};
