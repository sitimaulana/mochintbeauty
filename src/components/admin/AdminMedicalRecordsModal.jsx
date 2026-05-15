import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
        } else {
          setAfterImage(file);
          setAfterImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setError(null);
    }
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 py-4 text-center hover:border-[#8D6E63] transition-colors cursor-pointer overflow-hidden"
              onClick={() => document.getElementById('before-image-input').click()}
            >
              {beforeImagePreview ? (
                <div className="w-full flex justify-center py-1">
                  <div className="relative inline-block">
                    <img 
                      src={beforeImagePreview} 
                      alt="Before" 
                      className="max-h-40 rounded-lg object-contain"
                      onError={(e) => {
                        console.error('❌ Image failed to load: Before', {
                          url: beforeImagePreview,
                          status: e.target.status,
                          complete: e.target.complete,
                          naturalHeight: e.target.naturalHeight,
                          error: e.target.error
                        });
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage Failed to Load%3C/text%3E%3C/svg%3E';
                      }}
                      onLoadStart={() => console.log('📷 Before image loading...', beforeImagePreview)}
                      onLoad={() => console.log('✅ Before image loaded successfully')}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBeforeImage(null);
                        setBeforeImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Klik untuk upload foto before</p>
                  {existingRecord?.before_image_url && (
                    <p className="text-xs text-gray-500 mt-2">
                      Current: {existingRecord.before_image_url}
                    </p>
                  )}
                </div>
              )}
              <input
                id="before-image-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'before')}
                className="hidden"
              />
            </div>
          </div>

          {/* After Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Foto Setelah Perawatan (After)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 py-4 text-center hover:border-[#8D6E63] transition-colors cursor-pointer overflow-hidden"
              onClick={() => document.getElementById('after-image-input').click()}
            >
              {afterImagePreview ? (
                <div className="w-full flex justify-center py-1">
                  <div className="relative inline-block">
                    <img 
                      src={afterImagePreview} 
                      alt="After" 
                      className="max-h-40 rounded-lg object-contain"
                      onError={(e) => {
                        console.error('❌ Image failed to load: After', {
                          url: afterImagePreview,
                          status: e.target.status,
                          complete: e.target.complete,
                          naturalHeight: e.target.naturalHeight,
                          error: e.target.error
                        });
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage Failed to Load%3C/text%3E%3C/svg%3E';
                      }}
                      onLoadStart={() => console.log('📷 After image loading...', afterImagePreview)}
                      onLoad={() => console.log('✅ After image loaded successfully')}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAfterImage(null);
                        setAfterImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Klik untuk upload foto after</p>
                  {existingRecord?.after_image_url && (
                    <p className="text-xs text-gray-500 mt-2">
                      Current: {existingRecord.after_image_url}
                    </p>
                  )}
                </div>
              )}
              <input
                id="after-image-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'after')}
                className="hidden"
              />
            </div>
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
