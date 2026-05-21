import { FACE_DETECTION, SKIN_TONE_DETECTION, BOUNDING_BOX } from '../constants';

/**
 * Detect face and validate face position, lighting, and bounding box
 * @param {HTMLVideoElement} video - Video element from camera
 * @param {Object} setters - Object containing setter functions for state
 * @returns {void}
 */
export const detectFaceAndValidate = (
  video,
  setFaceDetected,
  setIsLighting,
  setIsFacePosition,
  setFaceInBox,
  setFaceBounds
) => {
  if (!video) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // --- DETECT BRIGHTNESS (LIGHTING) ---
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let brightness = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    brightness += (r + g + b) / 3;
  }
  brightness = brightness / (canvas.width * canvas.height);

  setIsLighting(
    brightness > FACE_DETECTION.MIN_BRIGHTNESS &&
      brightness < FACE_DETECTION.MAX_BRIGHTNESS
  );

  // --- DETECT FACE USING SKIN TONE ---
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scanRadius = Math.min(canvas.width, canvas.height) / 4;

  let skinToneCount = 0;
  const sampleSize = 100;
  let minX = canvas.width,
    maxX = 0,
    minY = canvas.height,
    maxY = 0;

  for (let i = 0; i < sampleSize; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * scanRadius;
    const x = Math.floor(centerX + Math.cos(angle) * distance);
    const y = Math.floor(centerY + Math.sin(angle) * distance);

    const index = (y * canvas.width + x) * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];

    // Check for skin tone
    if (
      r > SKIN_TONE_DETECTION.MIN_R &&
      g > SKIN_TONE_DETECTION.MIN_G &&
      b > SKIN_TONE_DETECTION.MIN_B &&
      r > b
    ) {
      skinToneCount++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  const faceDetectedNow = skinToneCount > sampleSize * FACE_DETECTION.MIN_SKIN_TONE_RATIO;
  setFaceDetected(faceDetectedNow);

  // --- CALCULATE FACE BOUNDING BOX ---
  if (faceDetectedNow && minX < maxX && minY < maxY) {
    const width = maxX - minX;
    const height = maxY - minY;
    const padding = Math.max(width, height) * 0.3;
    setFaceBounds({
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: width + padding * 2,
      height: height + padding * 2
    });
  } else {
    setFaceBounds(null);
  }

  // --- CHECK FACE POSITION (CENTERED) ---
  let darkPixelX = 0,
    darkPixelY = 0,
    darkCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const darkness = 255 - (r + g + b) / 3;

    if (darkness > FACE_DETECTION.MIN_DARKNESS_FOR_FACE) {
      const pixelIndex = i / 4;
      darkPixelX += pixelIndex % canvas.width;
      darkPixelY += Math.floor(pixelIndex / canvas.width);
      darkCount++;
    }
  }

  if (darkCount > 0) {
    darkPixelX /= darkCount;
    darkPixelY /= darkCount;

    const centerTolerance =
      canvas.width * FACE_DETECTION.CENTER_TOLERANCE_RATIO;
    const positionValid =
      Math.abs(darkPixelX - centerX) < centerTolerance &&
      Math.abs(darkPixelY - centerY) < centerTolerance;

    setIsFacePosition(positionValid && faceDetectedNow);
    const isInBox = faceDetectedNow && positionValid;
    setFaceInBox(isInBox);
  } else {
    setIsFacePosition(false);
    setFaceInBox(false);
  }
};

/**
 * Format currency to IDR format
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File bukan gambar' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'Ukuran file maksimal 5MB' };
  }

  return { isValid: true };
};

/**
 * Get severity color class based on severity level
 * @param {string} severity - Severity level (ringan, sedang, berat)
 * @returns {string} Tailwind color classes
 */
export const getSeverityColor = (severity) => {
  const severityMap = {
    ringan: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    sedang: 'bg-orange-100 border-orange-300 text-orange-800',
    berat: 'bg-red-100 border-red-300 text-red-800'
  };
  return severityMap[severity] || 'bg-gray-100 border-gray-300 text-gray-800';
};
