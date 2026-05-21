import React from 'react';
import { getSeverityColor, formatPrice } from '../utils/faceDetection';
import { COLORS } from '../constants';

const AnalysisResults = ({ result, imagePreview, onReset }) => {
  return (
    <div className="space-y-8">
      {/* Image and Overall Result */}
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
        {/* Image */}
        <div>
          <h3 className="text-lg font-bold text-[#5D4037] mb-4">Foto Analisis</h3>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border-2 border-blue-200 shadow-lg">
            <img
              src={imagePreview}
              alt="Analyzed"
              className="w-full h-80 object-cover rounded-lg border border-blue-300 shadow-md"
            />
          </div>
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
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-2 bg-gradient-to-r from-[#C4A57B] to-[#8D6E63] rounded-full flex-1"
                  style={{ width: `${result.confidence}%` }}
                ></div>
                <span className="text-sm font-semibold text-[#5D4037]">
                  {result.confidence}%
                </span>
              </div>
              <p className="text-xs text-gray-600">Tingkat Kepercayaan Analisis</p>

              {/* DETECTED CONDITION FROM YOUR MODEL */}
              {result.detectedCondition &&
                result.detectedCondition !== 'Unknown' && (
                  <div className="mt-4 pt-4 border-t border-[#C4A57B]">
                    <p className="text-sm text-gray-600 mb-2">
                      Masalah Kulit Terdeteksi
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-[#8D6E63]">
                        {result.detectedCondition
                          .replace('_', ' ')
                          .toUpperCase()}
                      </span>
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                        {result.conditionConfidence}%
                      </span>
                    </div>
                  </div>
                )}
            </div>

            {/* Skin Issues */}
            <div>
              <h4 className="font-bold text-[#5D4037] mb-3">
                Masalah Kulit Terdeteksi:
              </h4>
              <div className="space-y-2">
                {result.skinCondition.map((condition, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-3 rounded-lg border ${getSeverityColor(
                      condition.severity
                    )} text-sm font-medium flex items-center justify-between`}
                  >
                    <span>{condition.issue}</span>
                    <span className="capitalize text-xs">
                      ({condition.severity})
                    </span>
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
        <h4 className="text-lg font-bold text-blue-900 mb-2">
          Hasil Analisis Lebih Akurat?
        </h4>
        <p className="text-blue-800 mb-6">
          Hubungi customer service kami untuk berkonsultasi langsung dengan
          beautician profesional.
        </p>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Hubungi Kami
        </button>
      </div>
    </div>
  );
};

export default AnalysisResults;
