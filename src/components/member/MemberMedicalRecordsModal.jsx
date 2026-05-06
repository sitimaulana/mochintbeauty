import React, { useState, useEffect } from 'react';
import { X, Download, ChevronDown, ChevronUp } from 'lucide-react';

const MemberMedicalRecordsModal = ({
  isOpen,
  onClose,
  medicalRecord
}) => {
  const [expandedSection, setExpandedSection] = useState('images');
  const [imageZoom, setImageZoom] = useState(null);

  if (!isOpen || !medicalRecord) return null;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const downloadImage = (imageUrl, imageName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#8D6E63] to-[#6D4C41] px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Detail Rekam Medis
              </h2>
              <p className="text-sm text-white/80 mt-1">
                Treatment: {medicalRecord.treatment_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Appointment Info */}
            <div className="bg-gradient-to-r from-[#FFF8F5] to-[#F5E6E0] p-4 rounded-lg border border-[#D7CCC8]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">
                    Tanggal Perawatan
                  </p>
                  <p className="text-lg font-display font-bold text-[#5D4037]">
                    {medicalRecord.date && new Date(medicalRecord.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">
                    Waktu Perawatan
                  </p>
                  <p className="text-lg font-display font-bold text-[#5D4037]">
                    {medicalRecord.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Before & After Images */}
            <div className="border-b border-gray-200 pb-4">
              <button
                onClick={() => toggleSection('images')}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8D6E63] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">📷</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-800">Foto Hasil Perawatan</p>
                    <p className="text-xs text-gray-500">Before & After Images</p>
                  </div>
                </div>
                {expandedSection === 'images' ? (
                  <ChevronUp className="text-[#8D6E63]" />
                ) : (
                  <ChevronDown className="text-[#8D6E63]" />
                )}
              </button>

              {expandedSection === 'images' && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before Image */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">Sebelum Perawatan</p>
                    {medicalRecord.before_image_url ? (
                      <div className="relative group">
                        <img
                          src={medicalRecord.before_image_url}
                          alt="Before Treatment"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#8D6E63] transition-colors"
                          onClick={() => setImageZoom({
                            src: medicalRecord.before_image_url,
                            title: 'Sebelum Perawatan'
                          })}
                        />
                        <button
                          onClick={() => downloadImage(medicalRecord.before_image_url, 'before-treatment.jpg')}
                          className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={18} className="text-[#8D6E63]" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <p className="text-gray-400">Foto belum tersedia</p>
                      </div>
                    )}
                  </div>

                  {/* After Image */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">Setelah Perawatan</p>
                    {medicalRecord.after_image_url ? (
                      <div className="relative group">
                        <img
                          src={medicalRecord.after_image_url}
                          alt="After Treatment"
                          className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#8D6E63] transition-colors"
                          onClick={() => setImageZoom({
                            src: medicalRecord.after_image_url,
                            title: 'Setelah Perawatan'
                          })}
                        />
                        <button
                          onClick={() => downloadImage(medicalRecord.after_image_url, 'after-treatment.jpg')}
                          className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={18} className="text-[#8D6E63]" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <p className="text-gray-400">Foto belum tersedia</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis */}
            {medicalRecord.diagnosis && (
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleSection('diagnosis')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8D6E63] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">🏥</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Diagnosis</p>
                    </div>
                  </div>
                  {expandedSection === 'diagnosis' ? (
                    <ChevronUp className="text-[#8D6E63]" />
                  ) : (
                    <ChevronDown className="text-[#8D6E63]" />
                  )}
                </button>

                {expandedSection === 'diagnosis' && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {medicalRecord.diagnosis}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Treatment Detail */}
            {medicalRecord.treatment_detail && (
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleSection('detail')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8D6E63] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">✨</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Detail Treatment</p>
                    </div>
                  </div>
                  {expandedSection === 'detail' ? (
                    <ChevronUp className="text-[#8D6E63]" />
                  ) : (
                    <ChevronDown className="text-[#8D6E63]" />
                  )}
                </button>

                {expandedSection === 'detail' && (
                  <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {medicalRecord.treatment_detail}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Medical Notes */}
            {medicalRecord.medical_notes && (
              <div className="border-b border-gray-200 pb-4">
                <button
                  onClick={() => toggleSection('notes')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8D6E63] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">📝</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Catatan Medis</p>
                    </div>
                  </div>
                  {expandedSection === 'notes' ? (
                    <ChevronUp className="text-[#8D6E63]" />
                  ) : (
                    <ChevronDown className="text-[#8D6E63]" />
                  )}
                </button>

                {expandedSection === 'notes' && (
                  <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {medicalRecord.medical_notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {medicalRecord.recommendations && (
              <div className="pb-4">
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8D6E63] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">💡</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Rekomendasi Perawatan Lanjutan</p>
                    </div>
                  </div>
                  {expandedSection === 'recommendations' ? (
                    <ChevronUp className="text-[#8D6E63]" />
                  ) : (
                    <ChevronDown className="text-[#8D6E63]" />
                  )}
                </button>

                {expandedSection === 'recommendations' && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {medicalRecord.recommendations}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#8D6E63] text-white rounded-lg hover:bg-[#6D4C41] transition-colors font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {imageZoom && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 cursor-pointer"
          onClick={() => setImageZoom(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setImageZoom(null)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full hover:bg-gray-200 z-10"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <p className="text-white font-bold mb-4">{imageZoom.title}</p>
              <img
                src={imageZoom.src}
                alt={imageZoom.title}
                className="max-h-[80vh] w-auto mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberMedicalRecordsModal;
