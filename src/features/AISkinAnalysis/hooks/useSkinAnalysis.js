import { useState } from 'react';
import { analyzeSkinImage } from '../api/skinAnalysisAPI';

/**
 * Custom hook for skin analysis
 * @returns {Object} Skin analysis state and functions
 */
export const useSkinAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyzeImage = async (imagePreview) => {
    if (!imagePreview) {
      setError('Silakan upload atau ambil foto terlebih dahulu');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeSkinImage(imagePreview);
      setAnalysisResult(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Gagal menganalisis foto. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Error analyzing image:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return {
    analysisResult,
    setAnalysisResult,
    isAnalyzing,
    error,
    setError,
    analyzeImage,
    reset
  };
};
