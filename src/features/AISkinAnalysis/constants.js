// Color scheme
export const COLORS = {
  PRIMARY: '#C4A57B',
  PRIMARY_DARK: '#B89968',
  SECONDARY: '#8D6E63',
  DARK_BROWN: '#5D4037',
  DARK_BROWN_2: '#3E2723',
  LIGHT_BG: '#FDFBF7',
  LIGHT_BG_2: '#F5E6D3',
  LIGHT_BG_3: '#FDF8F5',
  BORDER_LIGHT: '#E8DCC8',
};

// API Endpoints
export const API_ENDPOINTS = {
  ANALYZE_SKIN: '/api/ai/analyze-skin',
};

// Face Detection Thresholds
export const FACE_DETECTION = {
  MIN_BRIGHTNESS: 20,
  MAX_BRIGHTNESS: 250,
  MIN_SKIN_TONE_RATIO: 0.3,
  MIN_DARKNESS_FOR_FACE: 100,
  CENTER_TOLERANCE_RATIO: 0.3,
  DETECTION_INTERVAL_MS: 300,
};

// Face Detection Skin Tone Detection (RGB values)
export const SKIN_TONE_DETECTION = {
  MIN_R: 95,
  MIN_G: 40,
  MIN_B: 20,
};

// File Upload Constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
};

// Bounding Box for Face Detection
export const BOUNDING_BOX = {
  WIDTH: 140,
  HEIGHT: 180,
  SUCCESS_COLOR: '#10b981',
  ERROR_COLOR: '#ef4444',
  SUCCESS_BORDER_WIDTH: 6,
  ERROR_BORDER_WIDTH: 4,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_IMAGE: 'Silakan upload file gambar yang valid',
  FILE_TOO_LARGE: 'Ukuran file maksimal 5MB',
  CAMERA_ACCESS_DENIED: 'Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.',
  CAMERA_REFRESH_FAILED: 'Gagal me-refresh kamera. Silakan coba lagi.',
  NO_IMAGE_SELECTED: 'Silakan upload atau ambil foto terlebih dahulu',
  ANALYSIS_FAILED: 'Gagal menganalisis foto. Silakan coba lagi.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CAMERA_STARTED: 'Kamera berhasil diaktifkan',
  IMAGE_UPLOADED: 'Foto berhasil diunggah',
  ANALYSIS_COMPLETED: 'Analisis selesai',
};

// Skin Types
export const SKIN_TYPES = [
  {
    id: 1,
    name: 'Normal',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop',
    description: 'Kulit yang seimbang dengan produksi minyak optimal. Kulit normal memiliki tekstur halus, pori-pori tidak terlalu besar, dan jarang bermasalah.'
  },
  {
    id: 2,
    name: 'Kering',
    image: 'https://images.unsplash.com/photo-1570158268183-d296b2892fdc?w=400&h=400&fit=crop',
    description: 'Kulit yang ditandai dengan lipatan, garis, dan kerutan di permukaan kulit. Kulit kering memiliki produksi minyak rendah di lapisan dermis kulit.'
  },
  {
    id: 3,
    name: 'Berminyak',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
    description: 'Kulit yang ditandai dengan kilau berlebihan dan pori-pori yang terlihat besar. Kulit berminyak memiliki produksi sebum berlebihan di lapisan dermis kulit.'
  },
  {
    id: 4,
    name: 'Kombinasi',
    image: 'https://images.unsplash.com/photo-1596040514248-de04d17f914f?w=400&h=400&fit=crop',
    description: 'Kulit yang ditandai dengan karakteristik campuran - berminyak di zona T dan kering di area lain. Kombinasi kelipatannya produksi kolagen bervariasi di lapisan dermis kulit.'
  },
  {
    id: 5,
    name: 'Sensitif',
    image: 'https://images.unsplash.com/photo-1599290234420-e3bbc5efb55b?w=400&h=400&fit=crop',
    description: 'Kulit yang mudah teriritasi dan bereaksi terhadap produk atau faktor lingkungan. Kulit sensitif sering mengalami kemerahan, gatal, dan peradangan.'
  }
];

// Severity Colors
export const SEVERITY_COLORS = {
  ringan: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  sedang: 'bg-orange-100 border-orange-300 text-orange-800',
  berat: 'bg-red-100 border-red-300 text-red-800',
  default: 'bg-gray-100 border-gray-300 text-gray-800',
};

// Skin Condition Translations (English to Indonesian)
export const SKIN_CONDITION_TRANSLATIONS = {
  'acne': 'Jerawat',
  'blackheades': 'Komedo',
  'blackheads': 'Komedo',
  'dark spots': 'Bintik Hitam',
  'darkspots': 'Bintik Hitam',
  'pores': 'Pori-pori',
  'redness': 'Kemerahan',
  'wrinkles': 'Kerutan',
  'jerawat': 'Jerawat',
  'komedo': 'Komedo',
  'bintik hitam': 'Bintik Hitam',
  'pori-pori': 'Pori-pori',
  'kemerahan': 'Kemerahan',
  'kerutan': 'Kerutan',
};
