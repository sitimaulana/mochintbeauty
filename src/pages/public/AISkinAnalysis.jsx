import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Sparkles, AlertCircle, CheckCircle, Loader, X } from 'lucide-react';
import axios from 'axios';

const AISkinAnalysis = () => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // --- STATE ---
  const [showIntro, setShowIntro] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // --- HANDLE CAMERA MODE CHANGE ---
  useEffect(() => {
    if (useCamera && !cameraActive) {
      // User switched to camera mode, start camera
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            setError(null);
          }
        } catch (err) {
          setError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
          console.error('Camera error:', err);
          setUseCamera(false);
        }
      };
      startCamera();
    } else if (!useCamera && cameraActive) {
      // User switched away from camera mode, stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        setCameraActive(false);
      }
    }

    // Cleanup: Stop camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [useCamera]);

  // --- HANDLE IMAGE UPLOAD ---
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith('image/')) {
      setError('Silakan upload file gambar yang valid');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setUploadedImage(file);
    setError(null);

    // Preview gambar
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // --- HANDLE CAMERA ---
  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
      console.error('Camera error:', err);
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setUploadedImage(file);
        setImagePreview(canvasRef.current.toDataURL('image/jpeg'));
        setUseCamera(false); // This triggers useEffect cleanup
        setError(null);
      }, 'image/jpeg', 0.95);
    }
  };

  // --- HANDLE ANALYZE BUTTON ---
  const handleAnalyze = async () => {
    if (!uploadedImage) {
      setError('Silakan upload atau ambil foto terlebih dahulu');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // TODO: Replace dengan actual API endpoint nanti setelah backend AI ready
      // Untuk sekarang, kita mock dengan delay dan dummy data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis result
      const mockResult = {
        skinType: 'Kombinasi',
        skinCondition: [
          { issue: 'Komedo', severity: 'sedang', color: 'yellow' },
          { issue: 'Kulit Berminyak', severity: 'ringan', color: 'orange' },
          { issue: 'Pigmentasi', severity: 'ringan', color: 'red' }
        ],
        recommendations: [
          {
            id: 1,
            treatment: 'Facial HydraFacial',
            reason: 'Untuk membersihkan pori-pori dan menghilangkan komedo',
            price: 350000
          },
          {
            id: 2,
            treatment: 'Chemical Peel',
            reason: 'Untuk mengatasi pigmentasi dan mencerahkan kulit',
            price: 250000
          },
          {
            id: 3,
            treatment: 'Hydrating Mask Treatment',
            reason: 'Untuk menyeimbangkan kelembaban kulit kombinasi',
            price: 150000
          }
        ],
        confidence: 87
      };

      setAnalysisResult(mockResult);
      setShowResults(true);
    } catch (err) {
      setError('Gagal menganalisis foto. Silakan coba lagi.');
      console.error('Error analyzing image:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- RESET ANALYSIS ---
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setShowResults(false);
    setError(null);
    setUseCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- REMOVE IMAGE ---
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- INTRO SCREEN ---
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] via-[#F5E6D3] to-[#FDFBF7] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Intro Content */}
          <div className="text-center space-y-8">

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-[#3E2723] tracking-tight">
                AI Skin Analysis
              </h1>
              <p className="text-xl text-gray-600 font-sans leading-relaxed">
                Temukan jenis kulit Anda dan dapatkan rekomendasi treatment personal dari AI kami
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-2">Foto Real-Time</h3>
                <p className="text-sm text-gray-600">Ambil foto langsung dari kamera atau upload dari galeri</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-2">Analisis Akurat</h3>
                <p className="text-sm text-gray-600">Teknologi AI mendeteksi masalah kulit Anda dengan presisi</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-[#C4A57B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-[#8D6E63]" />
                </div>
                <h3 className="font-bold text-[#3E2723] mb-2">Rekomendasi Personal</h3>
                <p className="text-sm text-gray-600">Treatment khusus sesuai dengan kebutuhan kulit Anda</p>
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
              Hasil analisis ini adalah panduan awal. Untuk diagnosis akurat, konsultasi dengan dermatolog profesional.
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
            Dapatkan analisis kulit wajah Anda secara real-time menggunakan teknologi AI. 
            Kami akan memberikan diagnosis jenis kulit dan rekomendasi treatment yang tepat untuk Anda.
          </p>
        </div>

        {/* Main Content */}
        {!showResults ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Upload/Camera Section */}
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#5D4037] mb-4">
                    {useCamera ? 'Ambil Foto Wajah' : 'Unggah Foto Wajah Anda'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Pastikan pencahayaan baik dan wajah terlihat jelas untuk hasil analisis terbaik.
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
                    <>
                      {!imagePreview ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-3 border-dashed border-[#C4A57B] rounded-xl p-8 text-center cursor-pointer hover:bg-[#FDF8F5] transition-colors"
                        >
                          <Upload className="w-12 h-12 text-[#C4A57B] mx-auto mb-3" />
                          <p className="text-[#5D4037] font-semibold mb-2">
                            Klik untuk upload foto
                          </p>
                          <p className="text-sm text-gray-500">
                            atau drag & drop di sini
                          </p>
                          <p className="text-xs text-gray-400 mt-3">
                            Maksimal 5MB • Format: JPG, PNG, WebP
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </>
                  ) : (
                    <>
                      {/* Camera Mode - Video Element Always Present */}
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-64 object-cover rounded-xl bg-black"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Show loading message while camera initializing */}
                        {!cameraActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                            <div className="text-center">
                              <Loader className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                              <p className="text-white text-sm">Mengaktifkan kamera...</p>
                            </div>
                          </div>
                        )}

                        {/* Capture/Stop Buttons */}
                        {cameraActive && (
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={handleCapture}
                              className="flex-1 py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                            >
                              <Camera className="w-5 h-5" />
                              Ambil Foto
                            </button>
                            <button
                              onClick={() => setUseCamera(false)}
                              className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    </>
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
                  disabled={!imagePreview || isAnalyzing}
                  className={`mt-6 w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    imagePreview && !isAnalyzing
                      ? 'bg-[#C4A57B] text-white hover:bg-[#B89968] cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
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
                <h3 className="text-xl font-bold text-[#5D4037]">Tips Foto Terbaik</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Camera className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#5D4037]">Pencahayaan Alami</p>
                      <p className="text-sm text-gray-600">
                        Ambil foto di area dengan cahaya alami yang cukup, hindari backlight
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[#C4A57B] flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-[#5D4037]">Wajah Bersih</p>
                      <p className="text-sm text-gray-600">
                        Lepas makeup dan cuci wajah terlebih dahulu untuk hasil akurat
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
                      <p className="font-semibold text-[#5D4037]">Resolusi Tinggi</p>
                      <p className="text-sm text-gray-600">
                        Gunakan kamera dengan resolusi tinggi untuk detail yang lebih baik
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">ℹ️ Info:</span> Analisis AI kami memberikan panduan awal. 
                    Konsultasi dengan dermatolog profesional untuk diagnosis yang lebih akurat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <AnalysisResults 
            result={analysisResult} 
            imagePreview={imagePreview}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

// --- ANALYSIS RESULTS COMPONENT ---
const AnalysisResults = ({ result, imagePreview, onReset }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'ringan':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'sedang':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'berat':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Image and Overall Result */}
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
        {/* Image */}
        <div>
          <h3 className="text-lg font-bold text-[#5D4037] mb-4">Foto Analisis</h3>
          <img
            src={imagePreview}
            alt="Analyzed"
            className="w-full h-80 object-cover rounded-xl shadow-md"
          />
        </div>

        {/* Skin Type Result */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#5D4037] mb-4">Hasil Analisis</h3>
            
            <div className="mb-6 p-6 bg-gradient-to-br from-[#FDF8F5] to-[#F5E6D3] rounded-xl border-2 border-[#C4A57B]">
              <p className="text-sm text-gray-600 mb-2">Tipe Kulit Anda</p>
              <h2 className="text-4xl font-bold text-[#5D4037] mb-4">
                {result.skinType}
              </h2>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gradient-to-r from-[#C4A57B] to-[#8D6E63] rounded-full flex-1" style={{ width: `${result.confidence}%` }}></div>
                <span className="text-sm font-semibold text-[#5D4037]">{result.confidence}%</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">Tingkat Kepercayaan Analisis</p>
            </div>

            {/* Skin Issues */}
            <div>
              <h4 className="font-bold text-[#5D4037] mb-3">Masalah Kulit Terdeteksi:</h4>
              <div className="space-y-2">
                {result.skinCondition.map((condition, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-3 rounded-lg border ${getSeverityColor(
                      condition.severity
                    )} text-sm font-medium flex items-center justify-between`}
                  >
                    <span>{condition.issue}</span>
                    <span className="capitalize text-xs">({condition.severity})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            className="mt-6 w-full py-3 px-6 bg-[#C4A57B] text-white rounded-lg font-semibold hover:bg-[#B89968] transition-colors"
          >
            Analisis Foto Lain
          </button>
        </div>
      </div>

      {/* Recommended Treatments */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-[#5D4037] mb-6">
          Rekomendasi Treatment
        </h3>
        
        <div className="space-y-4">
          {result.recommendations.map((treatment) => (
            <div
              key={treatment.id}
              className="border-2 border-[#E8DCC8] rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-[#5D4037] mb-2">
                    {treatment.treatment}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {treatment.reason}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#C4A57B]">
                      {formatPrice(treatment.price)}
                    </span>
                    <span className="text-xs text-gray-500">/sesi</span>
                  </div>
                </div>

                <button className="px-6 py-2 bg-[#C4A57B] text-white rounded-lg font-semibold hover:bg-[#B89968] transition-colors whitespace-nowrap">
                  Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
        <h4 className="text-lg font-bold text-blue-900 mb-2">Hasil Analisis Lebih Akurat?</h4>
        <p className="text-blue-800 mb-6">
          Hubungi customer service kami untuk berkonsultasi langsung dengan beautician profesional.
        </p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Hubungi Kami
        </button>
      </div>
    </div>
  );
};

export default AISkinAnalysis;
