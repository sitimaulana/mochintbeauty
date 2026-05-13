import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { medicalRecordsAPI } from '../../services/api';

const MemberBeforePhotoUpload = ({ 
  appointment, 
  onSuccess, 
  onClose 
}) => {
  const [uploadMode, setUploadMode] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  
  const fileInputRef = useRef(null);
  const cameraRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-start camera when upload mode changes to 'camera'
  useEffect(() => {
    if (uploadMode === 'camera' && !cameraActive) {
      console.log('🎬 useEffect: uploadMode is camera, starting camera...');
      startCamera();
    }
    
    return () => {
      // Cleanup: stop camera if component unmounts
      if (uploadMode === 'camera' && cameraRef.current?.srcObject) {
        console.log('🎬 useEffect cleanup: Stopping camera...');
        stopCamera();
      }
    };
  }, [uploadMode]);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Silakan upload file gambar (JPG, PNG, dll)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file tidak boleh melebihi 5MB');
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setError(null);
      console.log('📷 Starting camera with facingMode:', facingMode);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('❌ Browser tidak mendukung akses kamera');
        return;
      }

      let stream = null;

      // Try dengan constraint yang lebih ketat dulu
      try {
        console.log('🔧 Attempting strict constraints...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        console.log('✅ Got stream with strict constraints');
      } catch (constraintErr) {
        if (constraintErr.name === 'OverconstrainedError') {
          console.warn('⚠️ Strict constraints not supported, trying relaxed constraints...');
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
            audio: false
          });
          console.log('✅ Got stream with relaxed constraints');
        } else {
          throw constraintErr;
        }
      }

      // Now set the stream to video element
      if (!cameraRef.current) {
        console.error('❌ Camera ref not available');
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setError('❌ Video element reference tidak ditemukan');
        return;
      }

      console.log('🎥 Attaching stream to video element...');
      cameraRef.current.srcObject = stream;

      // Wait for video to be ready with a timeout
      const videoReadyPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video initialization timeout - stream not responding'));
        }, 5000);

        const handleCanPlay = () => {
          console.log('✅ Video can play');
          clearTimeout(timeout);
          cameraRef.current?.removeEventListener('canplay', handleCanPlay);
          resolve();
        };

        const handleLoadedMetadata = () => {
          console.log('✅ Video metadata loaded:', {
            videoWidth: cameraRef.current?.videoWidth,
            videoHeight: cameraRef.current?.videoHeight
          });
          clearTimeout(timeout);
          cameraRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
          resolve();
        };

        if (cameraRef.current) {
          cameraRef.current.addEventListener('canplay', handleCanPlay, { once: true });
          cameraRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });

          // Ensure play is called
          const playPromise = cameraRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.error('❌ Play failed:', e);
              clearTimeout(timeout);
              reject(e);
            });
          }
        }
      });

      await videoReadyPromise;
      console.log('✅ Video stream ready!');
      setCameraActive(true);

    } catch (err) {
      console.error('❌ Camera error:', err);
      setCameraActive(false);
      
      // Handle specific camera errors
      if (err.name === 'NotAllowedError') {
        setError('❌ Izin kamera ditolak. Silakan berikan izin akses kamera di browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('❌ Kamera tidak ditemukan di perangkat ini.');
      } else if (err.name === 'NotReadableError') {
        setError('❌ Kamera sedang digunakan oleh aplikasi lain.');
      } else if (err.name === 'OverconstrainedError') {
        setError('❌ Kamera tidak mendukung constraint yang diminta. Coba device lain.');
      } else if (err.message?.includes('timeout')) {
        setError('❌ Kamera timeout - coba berikan izin dan refresh halaman.');
      } else {
        setError(`❌ Error akses kamera: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (cameraRef.current?.srcObject) {
      const tracks = cameraRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    // Give more time for the previous stream to fully stop
    setTimeout(() => startCamera(), 500);
  };

  const capturePhoto = () => {
    try {
      if (!cameraRef.current) {
        setError('❌ Referensi kamera tidak ditemukan');
        return;
      }

      const video = cameraRef.current;
      
      // Validasi video dimensions dengan tolerance
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('⚠️ Video belum siap:', { width: video.videoWidth, height: video.videoHeight });
        console.warn('⚠️ Mencoba menunggu video siap...', {
          readyState: video.readyState,
          networkState: video.networkState
        });
        setError('❌ Kamera belum siap. Tunggu sebentar dan coba lagi.');
        return;
      }

      // Additional check - ensure video is playing
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.warn('⚠️ Video readyState:', video.readyState, '(HAVE_ENOUGH_DATA=4)');
        setError('❌ Video stream belum siap. Tunggu sebentar dan coba lagi.');
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        setError('❌ Canvas tidak ditemukan');
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        setError('❌ Tidak bisa mengakses canvas context');
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log('📸 Drawing video to canvas:', { 
        videoWidth: video.videoWidth, 
        videoHeight: video.videoHeight,
        readyState: video.readyState
      });
      
      // Draw video to canvas
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      // Convert canvas to JPEG blob with better error handling
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('❌ toBlob returned null');
            setError('❌ Gagal membuat blob dari canvas. Coba lagi.');
            return;
          }

          try {
            const file = new File([blob], `before_photo_${Date.now()}.jpg`, { 
              type: 'image/jpeg' 
            });
            
            console.log('📸 Photo captured successfully:', {
              size: file.size,
              type: file.type,
              name: file.name,
              blobSize: blob.size
            });

            setPhoto(file);
            
            // Get data URL for preview
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoPreview(reader.result);
              stopCamera();
              setUploadMode(null);
              setError(null);
            };
            reader.onerror = () => {
              console.error('❌ FileReader error');
              setError('❌ Error membaca foto. Coba lagi.');
            };
            reader.readAsDataURL(blob);
          } catch (fileErr) {
            console.error('❌ Error creating file:', fileErr);
            setError('❌ Error memproses foto. Coba lagi.');
          }
        },
        'image/jpeg',
        0.9
      );
    } catch (err) {
      console.error('❌ Capture photo error:', err);
      setError(`❌ Error menangkap foto: ${err.message}`);
    }
  };

  // Reset
  const resetUpload = () => {
    try {
      stopCamera();
    } catch (e) {
      console.error('Error stopping camera:', e);
    }
    setPhoto(null);
    setPhotoPreview(null);
    setUploadMode(null);
    setError(null);
  };

  // Submit photo
  const handleSubmitPhoto = async () => {
    if (!photo || !appointment?.id) {
      setError('❌ Foto dan appointment ID diperlukan');
      return;
    }

    // Use appointment.member_id or appointment.id as fallback
    const memberId = appointment?.member_id || appointment?.id;
    if (!memberId) {
      setError('⚠️ Member ID tidak ditemukan. Silakan refresh halaman.');
      console.error('Missing member_id in appointment:', { appointment });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Use explicit appointment ID (numeric or string)
      const appointmentId = String(appointment.id);
      
      formData.append('appointment_id', appointmentId);
      formData.append('member_id', String(memberId));
      formData.append('treatment_name', appointment.treatment_name || 'Perawatan');
      formData.append('status', 'draft');
      formData.append('before_image', photo, photo.name || 'before_photo.jpg');

      console.log('📤 Uploading photo with data:', {
        appointment_id: appointmentId,
        member_id: memberId,
        treatment_name: appointment.treatment_name,
        file_size: photo.size,
        file_type: photo.type,
        file_name: photo.name
      });

      // Log FormData entries for debugging
      console.log('📋 FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (key === 'before_image') {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await medicalRecordsAPI.create(formData);

      console.log('✅ Upload successful:', response.data);
      setSuccess(true);
      setPhoto(null);
      setPhotoPreview(null);
      
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
    } catch (error) {
      console.error('❌ Error submitting photo:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      
      let errorMessage = 'Gagal mengunggah foto. Silakan coba lagi.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = '❌ Data tidak valid. Pastikan semua field terisi dengan benar.';
      } else if (error.response?.status === 404) {
        errorMessage = '❌ Appointment tidak ditemukan. Silakan refresh halaman.';
      } else if (error.response?.status === 500) {
        errorMessage = '❌ Error server. Silakan hubungi support.';
      } else if (error.message) {
        errorMessage = `❌ Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              Foto Sebelum Perawatan
            </h2>
            <p className="text-xs text-white/80 mt-1">
              {appointment?.treatment_name || 'Unggah foto untuk rekam medis'}
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose?.();
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success State */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
              <p className="text-green-700 font-semibold">
                ✅ Foto berhasil disimpan!
              </p>
              <p className="text-xs text-green-600 mt-2">
                Foto Anda telah ditambahkan ke rekam medis.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Mode Selection - ALWAYS SHOW unless in other states */}
          {!photoPreview && !success && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-semibold mb-3">
                Pilih cara untuk mengambil foto:
              </p>
              
              <button
                onClick={() => {
                  setUploadMode('camera');
                }}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-[#8D6E63] rounded-lg hover:bg-[#8D6E63]/10 transition-all"
              >
                <Camera size={24} className="text-[#8D6E63]" />
                <div className="text-left">
                  <p className="font-bold text-[#8D6E63]">Foto dari Kamera</p>
                  <p className="text-xs text-gray-500">Ambil foto langsung</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setUploadMode('file');
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-[#8D6E63] rounded-lg hover:bg-[#8D6E63]/10 transition-all"
              >
                <Upload size={24} className="text-[#8D6E63]" />
                <div className="text-left">
                  <p className="font-bold text-[#8D6E63]">Upload dari Galeri</p>
                  <p className="text-xs text-gray-500">Pilih foto dari device</p>
                </div>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tips:</strong> Pastikan pencahayaan cukup dan wajah/area treatment terlihat jelas untuk hasil rekam medis yang terbaik.
                </p>
              </div>
            </div>
          )}

          {/* Camera View */}
          {uploadMode === 'camera' && !photoPreview && (
            <div className="space-y-4">
              {/* Loading indicator */}
              {!cameraActive && (
                <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Loader2 size={16} className="animate-spin text-yellow-600" />
                  <p className="text-sm text-yellow-700">
                    Mengaktifkan kamera...
                  </p>
                </div>
              )}

              {/* Video Element - Always rendered */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={cameraRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                  onCanPlay={() => {
                    console.log('✅ Video can play');
                  }}
                  onLoadedMetadata={() => {
                    console.log('✅ Video metadata loaded:', {
                      videoWidth: cameraRef.current?.videoWidth,
                      videoHeight: cameraRef.current?.videoHeight
                    });
                  }}
                />
                <div className="absolute inset-0 border-4 border-white/20 pointer-events-none rounded-lg" />
              </div>

              <canvas
                ref={canvasRef}
                className="hidden"
              />

              {/* Buttons - only show when camera is active */}
              {cameraActive && (
                <div className="flex gap-2">
                  <button
                    onClick={switchCamera}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-semibold"
                  >
                    <RefreshCw size={16} />
                    Ganti Kamera
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-4 py-2 bg-[#8D6E63] text-white rounded-lg hover:bg-[#6D4C41] transition-all font-semibold text-lg"
                  >
                    📸 Ambil Foto
                  </button>
                </div>
              )}
              
              <button
                onClick={resetUpload}
                className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
              >
                Batal
              </button>
            </div>
          )}

          {/* Photo Preview */}
          {photoPreview && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                  Preview Foto
                </p>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleSubmitPhoto}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] text-white rounded-lg hover:from-[#6D4C41] hover:to-[#5D4037] disabled:opacity-50 transition-all font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Simpan Foto
                    </>
                  )}
                </button>
                <button
                  onClick={resetUpload}
                  disabled={loading}
                  className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all text-sm font-semibold"
                >
                  Ambil Ulang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberBeforePhotoUpload;
