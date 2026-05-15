import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, CheckCircle, AlertCircle, Camera, RefreshCw } from 'lucide-react';
import axios from 'axios';

const AdminMedicalRecordsModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  onSuccess,
  token 
}) => {
  const [formData, setFormData] = useState({
    treatment_name: '',
    medical_notes: '',
    diagnosis: '',
    treatment_detail: '',
    recommendations: '',
    status: 'completed'
  });

  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [beforeImagePreview, setBeforeImagePreview] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingRecord, setExistingRecord] = useState(null);

  // Camera states for before image
  const [beforeCameraActive, setBeforeCameraActive] = useState(false);
  const [beforeUploadMode, setBeforeUploadMode] = useState(null);
  const [beforeFacingMode, setBeforeFacingMode] = useState('user');
  const [beforeCameraLoading, setBeforeCameraLoading] = useState(false);

  // Camera states for after image
  const [afterCameraActive, setAfterCameraActive] = useState(false);
  const [afterUploadMode, setAfterUploadMode] = useState(null);
  const [afterFacingMode, setAfterFacingMode] = useState('user');
  const [afterCameraLoading, setAfterCameraLoading] = useState(false);

  // Refs
  const beforeCameraRef = useRef(null);
  const afterCameraRef = useRef(null);
  const beforeCanvasRef = useRef(null);
  const afterCanvasRef = useRef(null);
  const beforeFileInputRef = useRef(null);
  const afterFileInputRef = useRef(null);

  // Initialize form with appointment data and fetch existing record if any
  useEffect(() => {
    if (isOpen && appointment) {
      setFormData(prev => ({
        ...prev,
        treatment_name: appointment.treatment_name || ''
      }));
      
      // Fetch existing medical record if any
      fetchExistingRecord(appointment.id);
    }
  }, [isOpen, appointment]);

  // Cleanup cameras on unmount
  useEffect(() => {
    return () => {
      stopBeforeCamera();
      stopAfterCamera();
    };
  }, []);

  // Auto-start before camera when upload mode changes
  useEffect(() => {
    if (beforeUploadMode === 'camera' && !beforeCameraActive) {
      startBeforeCamera();
    }
    return () => {
      if (beforeUploadMode === 'camera') {
        stopBeforeCamera();
      }
    };
  }, [beforeUploadMode]);

  // Auto-start after camera when upload mode changes
  useEffect(() => {
    if (afterUploadMode === 'camera' && !afterCameraActive) {
      startAfterCamera();
    }
    return () => {
      if (afterUploadMode === 'camera') {
        stopAfterCamera();
      }
    };
  }, [afterUploadMode]);

  const fetchExistingRecord = async (appointmentId) => {
    try {
      const response = await axios.get(
        `/api/medical-records/appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.data) {
        const record = response.data.data;
        setExistingRecord(record);
        setFormData(prev => ({
          ...prev,
          medical_notes: record.medical_notes || '',
          diagnosis: record.diagnosis || '',
          treatment_detail: record.treatment_detail || '',
          recommendations: record.recommendations || '',
          status: record.status || 'completed'
        }));
        // Add cache busting parameter to force fresh image loads
        if (record.before_image_url) {
          const cacheBustUrl = `${record.before_image_url}?t=${Date.now()}`;
          console.log('📷 Loading before image:', cacheBustUrl);
          setBeforeImagePreview(cacheBustUrl);
        }
        if (record.after_image_url) {
          const cacheBustUrl = `${record.after_image_url}?t=${Date.now()}`;
          console.log('📷 Loading after image:', cacheBustUrl);
          setAfterImagePreview(cacheBustUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching existing record:', error);
    }
  };

  const handleImageChange = (e, imageType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (imageType === 'before') {
          setBeforeImage(file);
          setBeforeImagePreview(reader.result);
          setBeforeUploadMode(null);
        } else {
          setAfterImage(file);
          setAfterImagePreview(reader.result);
          setAfterUploadMode(null);
        }
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // CAMERA FUNCTIONS FOR BEFORE IMAGE
  const startBeforeCamera = async () => {
    try {
      setBeforeCameraLoading(true);
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser tidak mendukung akses kamera');
        setBeforeCameraLoading(false);
        return;
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: beforeFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (constraintErr) {
        if (constraintErr.name === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: beforeFacingMode },
            audio: false
          });
        } else {
          throw constraintErr;
        }
      }

      if (!beforeCameraRef.current) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setError('Video element tidak ditemukan');
        setBeforeCameraLoading(false);
        return;
      }

      beforeCameraRef.current.srcObject = stream;

      const videoReadyPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video initialization timeout'));
        }, 5000);

        const handleCanPlay = () => {
          clearTimeout(timeout);
          beforeCameraRef.current?.removeEventListener('canplay', handleCanPlay);
          resolve();
        };

        const handleLoadedMetadata = () => {
          clearTimeout(timeout);
          beforeCameraRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
          resolve();
        };

        if (beforeCameraRef.current) {
          beforeCameraRef.current.addEventListener('canplay', handleCanPlay, { once: true });
          beforeCameraRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });

          const playPromise = beforeCameraRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              clearTimeout(timeout);
              reject(e);
            });
          }
        }
      });

      await videoReadyPromise;
      setBeforeCameraActive(true);
      setBeforeCameraLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setBeforeCameraActive(false);
      setBeforeCameraLoading(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Izin kamera ditolak. Berikan izin di browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan di perangkat ini.');
      } else if (err.name === 'NotReadableError') {
        setError('Kamera sedang digunakan oleh aplikasi lain.');
      } else {
        setError(`Error akses kamera: ${err.message}`);
      }
    }
  };

  const stopBeforeCamera = () => {
    if (beforeCameraRef.current?.srcObject) {
      const tracks = beforeCameraRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setBeforeCameraActive(false);
    }
  };

  const switchBeforeCamera = async () => {
    stopBeforeCamera();
    setBeforeFacingMode(beforeFacingMode === 'user' ? 'environment' : 'user');
    setTimeout(() => startBeforeCamera(), 500);
  };

  const captureBeforePhoto = () => {
    try {
      if (!beforeCameraRef.current) {
        setError('Referensi kamera tidak ditemukan');
        return;
      }

      const video = beforeCameraRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Kamera belum siap. Tunggu sebentar dan coba lagi.');
        return;
      }

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setError('Video stream belum siap. Tunggu sebentar dan coba lagi.');
        return;
      }

      const canvas = beforeCanvasRef.current;
      if (!canvas) {
        setError('Canvas tidak ditemukan');
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        setError('Tidak bisa mengakses canvas context');
        return;
      }

      const canvasWidth = Math.max(video.videoWidth, 320);
      const canvasHeight = Math.max(video.videoHeight, 240);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Gagal membuat blob dari canvas. Coba lagi.');
            return;
          }

          try {
            const file = new File([blob], `before_photo_${Date.now()}.jpg`, { 
              type: 'image/jpeg' 
            });

            setBeforeImage(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
              setBeforeImagePreview(reader.result);
              stopBeforeCamera();
              setBeforeUploadMode(null);
              setError(null);
            };
            reader.onerror = () => {
              setError('Error membaca foto. Coba lagi.');
            };
            reader.readAsDataURL(blob);
          } catch (fileErr) {
            console.error('Error creating file:', fileErr);
            setError('Error memproses foto. Coba lagi.');
          }
        },
        'image/jpeg',
        1.0
      );
    } catch (err) {
      console.error('Capture photo error:', err);
      setError(`Error menangkap foto: ${err.message}`);
    }
  };

  const resetBeforeUpload = () => {
    try {
      stopBeforeCamera();
    } catch (e) {
      console.error('Error stopping camera:', e);
    }
    setBeforeUploadMode(null);
    setError(null);
  };

  // CAMERA FUNCTIONS FOR AFTER IMAGE
  const startAfterCamera = async () => {
    try {
      setAfterCameraLoading(true);
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Browser tidak mendukung akses kamera');
        setAfterCameraLoading(false);
        return;
      }

      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: afterFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (constraintErr) {
        if (constraintErr.name === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: afterFacingMode },
            audio: false
          });
        } else {
          throw constraintErr;
        }
      }

      if (!afterCameraRef.current) {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setError('Video element tidak ditemukan');
        setAfterCameraLoading(false);
        return;
      }

      afterCameraRef.current.srcObject = stream;

      const videoReadyPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Video initialization timeout'));
        }, 5000);

        const handleCanPlay = () => {
          clearTimeout(timeout);
          afterCameraRef.current?.removeEventListener('canplay', handleCanPlay);
          resolve();
        };

        const handleLoadedMetadata = () => {
          clearTimeout(timeout);
          afterCameraRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
          resolve();
        };

        if (afterCameraRef.current) {
          afterCameraRef.current.addEventListener('canplay', handleCanPlay, { once: true });
          afterCameraRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });

          const playPromise = afterCameraRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              clearTimeout(timeout);
              reject(e);
            });
          }
        }
      });

      await videoReadyPromise;
      setAfterCameraActive(true);
      setAfterCameraLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setAfterCameraActive(false);
      setAfterCameraLoading(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Izin kamera ditolak. Berikan izin di browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan di perangkat ini.');
      } else if (err.name === 'NotReadableError') {
        setError('Kamera sedang digunakan oleh aplikasi lain.');
      } else {
        setError(`Error akses kamera: ${err.message}`);
      }
    }
  };

  const stopAfterCamera = () => {
    if (afterCameraRef.current?.srcObject) {
      const tracks = afterCameraRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setAfterCameraActive(false);
    }
  };

  const switchAfterCamera = async () => {
    stopAfterCamera();
    setAfterFacingMode(afterFacingMode === 'user' ? 'environment' : 'user');
    setTimeout(() => startAfterCamera(), 500);
  };

  const captureAfterPhoto = () => {
    try {
      if (!afterCameraRef.current) {
        setError('Referensi kamera tidak ditemukan');
        return;
      }

      const video = afterCameraRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Kamera belum siap. Tunggu sebentar dan coba lagi.');
        return;
      }

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setError('Video stream belum siap. Tunggu sebentar dan coba lagi.');
        return;
      }

      const canvas = afterCanvasRef.current;
      if (!canvas) {
        setError('Canvas tidak ditemukan');
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        setError('Tidak bisa mengakses canvas context');
        return;
      }

      const canvasWidth = Math.max(video.videoWidth, 320);
      const canvasHeight = Math.max(video.videoHeight, 240);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      context.drawImage(video, 0, 0, canvasWidth, canvasHeight);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Gagal membuat blob dari canvas. Coba lagi.');
            return;
          }

          try {
            const file = new File([blob], `after_photo_${Date.now()}.jpg`, { 
              type: 'image/jpeg' 
            });

            setAfterImage(file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
              setAfterImagePreview(reader.result);
              stopAfterCamera();
              setAfterUploadMode(null);
              setError(null);
            };
            reader.onerror = () => {
              setError('Error membaca foto. Coba lagi.');
            };
            reader.readAsDataURL(blob);
          } catch (fileErr) {
            console.error('Error creating file:', fileErr);
            setError('Error memproses foto. Coba lagi.');
          }
        },
        'image/jpeg',
        1.0
      );
    } catch (err) {
      console.error('Capture photo error:', err);
      setError(`Error menangkap foto: ${err.message}`);
    }
  };

  const resetAfterUpload = () => {
    try {
      stopAfterCamera();
    } catch (e) {
      console.error('Error stopping camera:', e);
    }
    setAfterUploadMode(null);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append('appointment_id', appointment.id);
      form.append('member_id', appointment.member_id);
      form.append('treatment_name', formData.treatment_name);
      form.append('medical_notes', formData.medical_notes);
      form.append('diagnosis', formData.diagnosis);
      form.append('treatment_detail', formData.treatment_detail);
      form.append('recommendations', formData.recommendations);
      form.append('status', formData.status);

      if (beforeImage) {
        form.append('before_image', beforeImage);
      }
      if (afterImage) {
        form.append('after_image', afterImage);
      }

      let response;
      if (existingRecord) {
        // Update existing record
        response = await axios.put(
          `/api/medical-records/${existingRecord.id}`,
          form,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
      } else {
        // Create new record
        response = await axios.post(
          '/api/medical-records',
          form,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(response.data.data);
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error saving medical record:', error);
      setError(error.response?.data?.message || 'Failed to save medical record');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      treatment_name: '',
      medical_notes: '',
      diagnosis: '',
      treatment_detail: '',
      recommendations: '',
      status: 'completed'
    });
    setBeforeImage(null);
    setAfterImage(null);
    setBeforeImagePreview(null);
    setAfterImagePreview(null);
    setError(null);
    setSuccess(false);
    setExistingRecord(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-display">
            {existingRecord ? 'Update Rekam Medis' : 'Tambah Rekam Medis'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Appointment Info */}
          <div className="bg-gradient-to-r from-[#FFF8F5] to-[#F5E6E0] p-4 rounded-lg border border-[#D7CCC8]">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Appointment:</span> {appointment?.customer_name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Treatment:</span> {appointment?.treatment_name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date:</span> {appointment?.date} {appointment?.time}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">Rekam medis berhasil disimpan!</p>
            </div>
          )}

          {/* Before Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Foto Sebelum Perawatan (Before)
            </label>

            {/* Mode Selection or Preview */}
            {!beforeImagePreview && beforeUploadMode === null && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setBeforeUploadMode('camera')}
                  className="w-full flex items-center justify-center gap-3 p-3 border-2 border-[#8D6E63] rounded-lg hover:bg-[#8D6E63]/10 transition-all"
                >
                  <Camera size={20} className="text-[#8D6E63]" />
                  <div className="text-left">
                    <p className="font-bold text-[#8D6E63]">Foto dari Kamera</p>
                    <p className="text-xs text-gray-500">Ambil foto langsung</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => beforeFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 p-3 border-2 border-[#8D6E63] rounded-lg hover:bg-[#8D6E63]/10 transition-all"
                >
                  <Upload size={20} className="text-[#8D6E63]" />
                  <div className="text-left">
                    <p className="font-bold text-[#8D6E63]">Upload dari Galeri</p>
                    <p className="text-xs text-gray-500">Pilih foto dari device</p>
                  </div>
                </button>

                <input
                  ref={beforeFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'before')}
                  className="hidden"
                />
              </div>
            )}

            {/* Camera View for Before */}
            {beforeUploadMode === 'camera' && !beforeImagePreview && (
              <div className="space-y-4">
                {!beforeCameraActive && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Loader2 size={16} className="animate-spin text-yellow-600" />
                    <p className="text-sm text-yellow-700">Mengaktifkan kamera...</p>
                  </div>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden h-64">
                  <video
                    ref={beforeCameraRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Bounding Box Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dark corners (vignette effect) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30" />
                    
                    {/* Main bounding box frame */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      {/* Outer frame - head positioning guide */}
                      <rect
                        x="15%"
                        y="10%"
                        width="70%"
                        height="80%"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        opacity="0.8"
                      />
                      
                      {/* Center guides - horizontal line */}
                      <line
                        x1="15%"
                        y1="50%"
                        x2="85%"
                        y2="50%"
                        stroke="#22C55E"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                      
                      {/* Center guides - vertical line */}
                      <line
                        x1="50%"
                        y1="10%"
                        x2="50%"
                        y2="90%"
                        stroke="#22C55E"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                      
                      {/* Eye level guide line */}
                      <line
                        x1="15%"
                        y1="30%"
                        x2="85%"
                        y2="30%"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                      
                      {/* Corner markers - top left */}
                      <circle cx="15%" cy="10%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                      {/* Corner markers - top right */}
                      <circle cx="85%" cy="10%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                      {/* Corner markers - bottom left */}
                      <circle cx="15%" cy="90%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                      {/* Corner markers - bottom right */}
                      <circle cx="85%" cy="90%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                    </svg>
                    
                    {/* Instruction text */}
                    <div className="absolute top-3 left-3 right-3 text-white text-xs bg-black/50 px-2 py-1.5 rounded-lg">
                      <p className="font-bold">📍 Posisikan wajah di dalam kotak hijau</p>
                      <p className="text-white/80 text-xs">Sejajarkan mata dengan garis oranye</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-4 border-white/20 pointer-events-none rounded-lg" />
                </div>

                <canvas ref={beforeCanvasRef} className="hidden" />

                {beforeCameraActive && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={switchBeforeCamera}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-semibold"
                    >
                      <RefreshCw size={16} />
                      Ganti Kamera
                    </button>
                    <button
                      type="button"
                      onClick={captureBeforePhoto}
                      className="flex-1 px-4 py-2 bg-[#8D6E63] text-white rounded-lg hover:bg-[#6D4C41] transition-all font-semibold"
                    >
                      📸 Ambil Foto
                    </button>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={resetBeforeUpload}
                  className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
                >
                  Batal
                </button>
              </div>
            )}

            {/* Preview */}
            {beforeImagePreview && (
              <div className="space-y-3">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={beforeImagePreview} 
                    alt="Before" 
                    className="w-full h-48 object-cover rounded-lg"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBeforeImage(null);
                      setBeforeImagePreview(null);
                      setBeforeUploadMode(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBeforeImage(null);
                    setBeforeImagePreview(null);
                    setBeforeUploadMode(null);
                  }}
                  className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
                >
                  Ganti Foto
                </button>
              </div>
            )}
          </div>

          {/* After Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Foto Setelah Perawatan (After)
            </label>

            {/* Mode Selection or Preview */}
            {!afterImagePreview && afterUploadMode === null && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setAfterUploadMode('camera')}
                  className="w-full flex items-center justify-center gap-3 p-3 border-2 border-[#8D6E63] rounded-lg hover:bg-[#8D6E63]/10 transition-all"
                >
                  <Camera size={20} className="text-[#8D6E63]" />
                  <div className="text-left">
                    <p className="font-bold text-[#8D6E63]">Foto dari Kamera</p>
                    <p className="text-xs text-gray-500">Ambil foto langsung</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => afterFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 p-3 border-2 border-[#8D6E63] rounded-lg hover:bg-[#8D6E63]/10 transition-all"
                >
                  <Upload size={20} className="text-[#8D6E63]" />
                  <div className="text-left">
                    <p className="font-bold text-[#8D6E63]">Upload dari Galeri</p>
                    <p className="text-xs text-gray-500">Pilih foto dari device</p>
                  </div>
                </button>

                <input
                  ref={afterFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'after')}
                  className="hidden"
                />
              </div>
            )}

            {/* Camera View for After */}
            {afterUploadMode === 'camera' && !afterImagePreview && (
              <div className="space-y-4">
                {!afterCameraActive && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Loader2 size={16} className="animate-spin text-yellow-600" />
                    <p className="text-sm text-yellow-700">Mengaktifkan kamera...</p>
                  </div>
                )}

                <div className="relative bg-black rounded-lg overflow-hidden h-64">
                  <video
                    ref={afterCameraRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Bounding Box Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dark corners (vignette effect) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30" />
                    
                    {/* Main bounding box frame */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                      {/* Outer frame - head positioning guide */}
                      <rect
                        x="15%"
                        y="10%"
                        width="70%"
                        height="80%"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        opacity="0.8"
                      />
                      
                      {/* Center guides - horizontal line */}
                      <line
                        x1="15%"
                        y1="50%"
                        x2="85%"
                        y2="50%"
                        stroke="#22C55E"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                      
                      {/* Center guides - vertical line */}
                      <line
                        x1="50%"
                        y1="10%"
                        x2="50%"
                        y2="90%"
                        stroke="#22C55E"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                        opacity="0.6"
                      />
                      
                      {/* Eye level guide line */}
                      <line
                        x1="15%"
                        y1="30%"
                        x2="85%"
                        y2="30%"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                      
                      {/* Corner markers - top left */}
                      <circle cx="15%" cy="10%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                      {/* Corner markers - top right */}
                      <circle cx="85%" cy="10%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                      {/* Corner markers - bottom left */}
                      <circle cx="15%" cy="90%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                      {/* Corner markers - bottom right */}
                      <circle cx="85%" cy="90%" r="6" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.8" />
                    </svg>
                    
                    {/* Instruction text */}
                    <div className="absolute top-3 left-3 right-3 text-white text-xs bg-black/50 px-2 py-1.5 rounded-lg">
                      <p className="font-bold">📍 Posisikan wajah di dalam kotak hijau</p>
                      <p className="text-white/80 text-xs">Sejajarkan mata dengan garis oranye</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-4 border-white/20 pointer-events-none rounded-lg" />
                </div>

                <canvas ref={afterCanvasRef} className="hidden" />

                {afterCameraActive && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={switchAfterCamera}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm font-semibold"
                    >
                      <RefreshCw size={16} />
                      Ganti Kamera
                    </button>
                    <button
                      type="button"
                      onClick={captureAfterPhoto}
                      className="flex-1 px-4 py-2 bg-[#8D6E63] text-white rounded-lg hover:bg-[#6D4C41] transition-all font-semibold"
                    >
                      📸 Ambil Foto
                    </button>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={resetAfterUpload}
                  className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
                >
                  Batal
                </button>
              </div>
            )}

            {/* Preview */}
            {afterImagePreview && (
              <div className="space-y-3">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={afterImagePreview} 
                    alt="After" 
                    className="w-full h-48 object-cover rounded-lg"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAfterImage(null);
                      setAfterImagePreview(null);
                      setAfterUploadMode(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAfterImage(null);
                    setAfterImagePreview(null);
                    setAfterUploadMode(null);
                  }}
                  className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
                >
                  Ganti Foto
                </button>
              </div>
            )}
          </div>

          {/* Treatment Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nama Treatment
            </label>
            <input
              type="text"
              name="treatment_name"
              value={formData.treatment_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8D6E63]"
              placeholder="Nama treatment yang dilakukan"
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8D6E63] resize-none"
              placeholder="Kondisi atau diagnosis pasien"
            />
          </div>

          {/* Treatment Detail */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Detail Treatment
            </label>
            <textarea
              name="treatment_detail"
              value={formData.treatment_detail}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8D6E63] resize-none"
              placeholder="Detail treatment yang dilakukan"
            />
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Catatan Medis
            </label>
            <textarea
              name="medical_notes"
              value={formData.medical_notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8D6E63] resize-none"
              placeholder="Catatan medis tambahan"
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Rekomendasi Perawatan Lanjutan
            </label>
            <textarea
              name="recommendations"
              value={formData.recommendations}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8D6E63] resize-none"
              placeholder="Rekomendasi untuk perawatan berikutnya"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8D6E63]"
            >
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#8D6E63] text-white rounded-lg hover:bg-[#6D4C41] disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {existingRecord ? 'Update Rekam Medis' : 'Simpan Rekam Medis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminMedicalRecordsModal;
