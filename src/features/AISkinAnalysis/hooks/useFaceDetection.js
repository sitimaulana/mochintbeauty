import { useEffect, useRef, useState } from 'react';
import { detectFaceAndValidate } from '../utils/faceDetection';
import { FACE_DETECTION } from '../constants';

/**
 * Custom hook for face detection
 * @param {HTMLVideoElement} videoRef - Reference to video element
 * @param {boolean} cameraActive - Is camera currently active
 * @returns {Object} Face detection state and setters
 */
export const useFaceDetection = (videoRef, cameraActive) => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [isLighting, setIsLighting] = useState(false);
  const [isFacePosition, setIsFacePosition] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [faceBounds, setFaceBounds] = useState(null);
  const [faceInBox, setFaceInBox] = useState(false);

  const detectionIntervalRef = useRef(null);

  // Run face detection loop
  useEffect(() => {
    if (!cameraActive) {
      clearInterval(detectionIntervalRef.current);
      return;
    }

    detectionIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        detectFaceAndValidate(
          videoRef.current,
          setFaceDetected,
          setIsLighting,
          setIsFacePosition,
          setIsLooking,
          setFaceInBox,
          setFaceBounds
        );
      }
    }, FACE_DETECTION.DETECTION_INTERVAL_MS);

    return () => {
      clearInterval(detectionIntervalRef.current);
    };
  }, [cameraActive, videoRef]);

  return {
    faceDetected,
    setFaceDetected,
    isLighting,
    setIsLighting,
    isFacePosition,
    setIsFacePosition,
    isLooking,
    setIsLooking,
    faceBounds,
    setFaceBounds,
    faceInBox,
    setFaceInBox,
    detectionIntervalRef
  };
};
