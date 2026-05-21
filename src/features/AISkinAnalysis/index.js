// Export components
export { default as AnalysisResults } from './components/AnalysisResults';
export { default as SkinTypeCarousel } from './components/SkinTypeCarousel';
export { default as CameraModule } from './components/CameraModule';
export { default as ImageUploadModule } from './components/ImageUploadModule';

// Export hooks
export { useFaceDetection } from './hooks/useFaceDetection';
export { useSkinAnalysis } from './hooks/useSkinAnalysis';

// Export utils
export {
  detectFaceAndValidate,
  formatPrice,
  validateImageFile,
  getSeverityColor,
  translateCondition
} from './utils/faceDetection';

// Export API functions
export { analyzeSkinImage, getRecommendations } from './api/skinAnalysisAPI';

// Export constants
export {
  COLORS,
  API_ENDPOINTS,
  FACE_DETECTION,
  SKIN_TONE_DETECTION,
  FILE_UPLOAD,
  BOUNDING_BOX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SKIN_TYPES,
  SEVERITY_COLORS
} from './constants';
