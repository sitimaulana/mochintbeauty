import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import {
  AnalysisResults,
  SkinTypeCarousel,
  CameraModule,
  ImageUploadModule,
  useFaceDetection,
  useSkinAnalysis,
  validateImageFile,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../index';

const AISkinAnalysisPage = () => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Main states
  const [showIntro, setShowIntro] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [currentSkinTypeIndex, setCurrentSkinTypeIndex] = useState(0);

  // Custom hooks
  const faceDetection = useFaceDetection(videoRef, cameraActive);
  const skinAnalysis = useSkinAnalysis();

  // Handle camera mode change
  useEffect(() => {
    if (useCamera && !cameraActive) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            setError(null);
          }
        } catch (err) {
          setError(ERROR_MESSAGES.CAMERA_ACCESS_DENIED);
          console.error('Camera error:', err);
          setUseCamera(false);
        }
      };
      startCamera();
    } else if (!useCamera && cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        setCameraActive(false);
      }
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [useCamera]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setUploadedImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle camera capture
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.scale(-1, 1);
      context.drawImage(videoRef.current, -canvasRef.current.width, 0);

      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', {
          type: 'image/jpeg'
        });
        setUploadedImage(file);
        setImagePreview(canvasRef.current.toDataURL('image/jpeg'));
        setUseCamera(false);
        setError(null);
      }, 'image/jpeg', 0.95);
    }
  };

  // Handle camera refresh
  const handleRefreshCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CAMERA_REFRESH_FAILED);
      console.error('Refresh camera error:', err);
    }
  };

  // Handle analyze
  const handleAnalyze = async () => {
    const result = await skinAnalysis.analyzeImage(imagePreview);
    if (result) {
      // Success - results will be shown via showResults state update
    }
  };

  // Handle reset
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setError(null);
    setUseCamera(false);
    skinAnalysis.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle browse file
  const handleBrowseFile = () => {
    fileInputRef.current?.click();
  };

  // Intro Screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] via-[#F5E6D3] to-[#FDFBF7] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-8">
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-[#3E2723] tracking-tight">
                Mochint Skin Reveal
              </h1>
              <p className="text-xl text-gray-600 font-sans leading-relaxed">
                Temukan jenis kulit Anda dan dapatkan rekomendasi treatment
                personal dari AI kami
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-2">Foto Real-Time</h3>
                <p className="text-sm text-gray-600">
                  Ambil foto langsung dari kamera atau upload dari galeri
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-2">Analisis Akurat</h3>
                <p className="text-sm text-gray-600">
                  Teknologi AI mendeteksi masalah kulit Anda dengan presisi
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-2">
                  Rekomendasi Personal
                </h3>
                <p className="text-sm text-gray-600">
                  Treatment khusus sesuai dengan kebutuhan kulit Anda
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-4 px-8 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] text-white font-bold text-lg rounded-full hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            >
              Mulai Analisis Sekarang
            </button>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center px-4">
              Hasil analisis ini adalah panduan awal. Untuk diagnosis akurat,
              konsultasi dengan dermatolog profesional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#F5E6D3] py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-[#C4A57B]" />
            <h1 className="text-4xl md:text-5xl font-bold text-[#5D4037]">
              AI Skin Analysis
            </h1>
            <Sparkles className="w-8 h-8 text-[#C4A57B]" />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Dapatkan analisis kulit wajah Anda secara real-time menggunakan
            teknologi AI. Kami akan memberikan diagnosis jenis kulit dan
            rekomendasi treatment yang tepat untuk Anda.
          </p>
        </div>

        {/* Main Content */}
        {!skinAnalysis.analysisResult ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Upload/Camera Section */}
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#5D4037] mb-4">
                    {useCamera ? 'Ambil Foto Wajah' : 'Unggah Foto Wajah Anda'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Pastikan pencahayaan baik dan wajah terlihat jelas untuk
                    hasil analisis terbaik.
                  </p>

                  {/* Toggle Camera/Upload */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setUseCamera(false)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        !useCamera
                          ? 'bg-[#C4A57B] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={() => setUseCamera(true)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        useCamera
                          ? 'bg-[#C4A57B] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Camera className="w-4 h-4 inline mr-2" />
                      Kamera
                    </button>
                  </div>

                  {/* Upload Area */}
                  {!useCamera ? (
                    <ImageUploadModule
                      fileInputRef={fileInputRef}
                      imagePreview={imagePreview}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                      onBrowseFile={handleBrowseFile}
                    />
                  ) : (
                    <CameraModule
                      videoRef={videoRef}
                      canvasRef={canvasRef}
                      cameraActive={cameraActive}
                      faceDetected={faceDetection.faceDetected}
                      faceInBox={faceDetection.faceInBox}
                      error={error}
                      useCamera={useCamera}
                      onCapture={handleCapture}
                      onRefreshCamera={handleRefreshCamera}
                      onToggleMode={() => setUseCamera(false)}
                      onBrowseFile={handleBrowseFile}
                      fileInputRef={fileInputRef}
                    />
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!imagePreview || skinAnalysis.isAnalyzing}
                  className={`mt-6 w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    imagePreview && !skinAnalysis.isAnalyzing
                      ? 'bg-[#C4A57B] text-white hover:bg-[#B89968] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {skinAnalysis.isAnalyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analisis Kulit Saya
                    </>
                  )}
                </button>
              </div>

              {/* Tips Section */}
              <div className="bg-[#FDF8F5] rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#5D4037]">
                  Tips Foto Terbaik
                </h3>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Camera className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#5D4037]">
                        Pencahayaan Alami
                      </p>
                      <p className="text-sm text-gray-600">
                        Ambil foto di area dengan cahaya alami yang cukup,
                        hindari backlight
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#5D4037]">Wajah Bersih</p>
                      <p className="text-sm text-gray-600">
                        Lepas makeup dan cuci wajah terlebih dahulu untuk hasil
                        akurat
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#5D4037]">Posisi Depan</p>
                      <p className="text-sm text-gray-600">
                        Arahkan wajah lurus ke kamera dengan ekspresi natural
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#5D4037]">
                        Resolusi Tinggi
                      </p>
                      <p className="text-sm text-gray-600">
                        Gunakan kamera dengan resolusi tinggi untuk detail yang
                        lebih baik
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">ℹ️ Info:</span> Analisis AI
                    kami memberikan panduan awal. Konsultasi dengan dermatolog
                    profesional untuk diagnosis yang lebih akurat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <AnalysisResults
            result={skinAnalysis.analysisResult}
            imagePreview={imagePreview}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default AISkinAnalysisPage;
