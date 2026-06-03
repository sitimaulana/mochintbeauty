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
      <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] via-[#F5E6D3] to-[#FDFBF7] flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-6 md:space-y-8">
            {/* Title */}
            <div className="space-y-2 md:space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-[#3E2723] tracking-tight">
                Mochint Skin Reveal
              </h1>
              <p className="text-base md:text-xl text-gray-600 font-sans leading-relaxed px-2">
                Temukan jenis kulit Anda dan dapatkan rekomendasi treatment
                personal dari AI kami
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 py-4 md:py-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/40 shadow-md">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-1 md:mb-2 text-sm md:text-base">Foto Real-Time</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Ambil foto langsung atau upload dari galeri
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/40 shadow-md">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-1 md:mb-2 text-sm md:text-base">Analisis Akurat</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  AI mendeteksi masalah kulit dengan presisi
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/40 shadow-md">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-1 md:mb-2 text-sm md:text-base">Rekomendasi Personal</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Treatment khusus sesuai kebutuhan kulit Anda
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowIntro(false)}
              className="w-full py-4 px-8 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] text-white font-bold text-lg rounded-full hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Mulai Analisis Sekarang
            </button>

            {/* Disclaimer */}
            <p className="text-[10px] md:text-xs text-gray-500 text-center px-4">
              Hasil analisis ini adalah panduan awal. Konsultasikan dengan dermatolog profesional.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] to-[#F5E6D3] py-6 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#C4A57B]" />
            <h1 className="text-3xl md:text-5xl font-bold text-[#5D4037]">
              AI Skin Analysis
            </h1>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#C4A57B]" />
          </div>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-2">
            Dapatkan analisis kulit wajah Anda secara real-time. Kami akan memberikan diagnosis jenis kulit dan rekomendasi treatment yang tepat.
          </p>
        </div>

        {/* Main Content */}
        {!skinAnalysis.analysisResult ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-white/20">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 p-5 md:p-8">
              {/* Upload/Camera Section */}
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#5D4037] mb-2 md:mb-4">
                    {useCamera ? 'Ambil Foto Wajah' : 'Unggah Foto Wajah Anda'}
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    Pastikan pencahayaan baik dan wajah terlihat jelas.
                  </p>

                  {/* Toggle Camera/Upload */}
                  <div className="flex gap-2 md:gap-3 mb-6">
                    <button
                      onClick={() => setUseCamera(false)}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm md:text-base transition-all flex items-center justify-center ${
                        !useCamera
                          ? 'bg-[#C4A57B] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={() => setUseCamera(true)}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm md:text-base transition-all flex items-center justify-center ${
                        useCamera
                          ? 'bg-[#C4A57B] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Kamera
                    </button>
                  </div>

                  {/* Upload Area */}
                  <div className="relative">
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
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!imagePreview || skinAnalysis.isAnalyzing}
                  className={`mt-6 w-full py-3.5 md:py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    imagePreview && !skinAnalysis.isAnalyzing
                      ? 'bg-[#C4A57B] text-white hover:bg-[#B89968] active:scale-[0.98]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
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

              {/* Tips Section - DIKEMBALIKAN UTUH & AMAN DI MOBILE */}
              <div className="bg-[#FDF8F5] rounded-xl p-5 md:p-6 space-y-4 border border-[#E8DCC8]">
                <h3 className="text-lg md:text-xl font-bold text-[#5D4037]">
                  Tips Foto Terbaik
                </h3>

                <div className="space-y-3.5">
                  <div className="flex gap-3">
                    <Camera className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#5D4037] text-sm">Pencahayaan Alami</p>
                      <p className="text-xs text-gray-600">Ambil foto di area terang dengan cahaya cukup, hindari backlight[cite: 2].</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#5D4037] text-sm">Wajah Bersih</p>
                      <p className="text-xs text-gray-600">Lepas makeup dan cuci wajah terlebih dahulu untuk hasil akurat[cite: 2].</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#5D4037] text-sm">Posisi Depan</p>
                      <p className="text-xs text-gray-600">Arahkan wajah lurus menghadap kamera dengan ekspresi natural[cite: 2].</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#5D4037] text-sm">Resolusi Tinggi</p>
                      <p className="text-xs text-gray-600">Gunakan kamera dengan resolusi tinggi agar detail kulit terbaca jelas[cite: 2].</p>
                    </div>
                  </div>
                </div>

                {/* Perbaikan Sintaks Kode Warna Latar Belakang */}
                <div className="bg-white/70 border border-[#E8DCC8] rounded-xl p-3.5 mt-4">
                  <p className="text-[11px] md:text-xs text-[#5D4037] leading-relaxed">
                    <span className="font-bold">Info:</span> Analisis AI kami memberikan panduan awal. Konsultasikan dengan dermatolog profesional untuk diagnosis yang lebih akurat[cite: 2].
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="animate-in fade-in duration-500 px-1">
            <AnalysisResults
              result={skinAnalysis.analysisResult}
              imagePreview={imagePreview}
              onReset={handleReset}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AISkinAnalysisPage;