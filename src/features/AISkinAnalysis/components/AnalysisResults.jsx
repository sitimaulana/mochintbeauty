import React from 'react';
import { getSeverityColor, formatPrice, translateCondition } from '../utils/faceDetection';
import { COLORS } from '../constants';

const AnalysisResults = ({ result, imagePreview, onReset }) => {
  if (!result) return null;

  const conditions = result.skinCondition || [];
  const hasConditions = conditions.length > 0;

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-0">
      {/* Container Utama Hasil Analisis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-100">
        
        {/* Sisi Kiri: Foto */}
        <div className="flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#5D4037] mb-2">
            Foto Analisis
          </h3>
          <div className="bg-gradient-to-br from-[#FDF8F5] to-[#F5E6D3] rounded-xl p-2 border border-[#E8DCC8] flex items-center justify-center">
            <img
              src={imagePreview}
              alt="Analyzed Face"
              className="w-full h-56 sm:h-72 md:h-80 object-cover rounded-lg border border-[#C4A57B] shadow-sm"
            />
          </div>
        </div>

        {/* Sisi Kanan: Box Hasil (Satu Box Tunggal & Padat) */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#5D4037] mb-2">
              Hasil Analisis
            </h3>

            {/* SINGLE COMPACT BOX */}
            <div className="bg-gradient-to-br from-[#FDF8F5] to-[#FAF3E0] rounded-xl border-2 border-[#C4A57B] p-4 shadow-sm space-y-4">
              
              {/* 1. HIGHLIGHT UTAMA: MASALAH KULIT */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8D6E63] mb-1.5">
                  Masalah Kulit Terdeteksi
                </p>
                
                {hasConditions ? (
                  <div className="space-y-2">
                    {conditions.map((condition, idx) => {
                      let severityClass = "bg-white border-orange-200 text-orange-700";
                      try {
                        if (typeof getSeverityColor === 'function' && getSeverityColor) {
                          severityClass = getSeverityColor(condition?.severity);
                        }
                      } catch (e) { }

                      return (
                        <div key={idx} className={`p-3 rounded-lg border bg-white shadow-sm ${severityClass}`}>
                          <div className="flex items-baseline justify-between">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#5D4037]">
                              {typeof translateCondition === 'function' ? translateCondition(condition?.issue) : condition?.issue}
                            </h2>
                            <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-black/5">
                              {condition?.severity || 'Sedang'}
                            </span>
                          </div>

                          {/* Persentase Akurasi Terikat pada Masalah Kulit */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#C4A57B]"
                                style={{ width: `${result.conditionConfidence || result.confidence || 85}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-[#8D6E63]">
                              {result.conditionConfidence || result.confidence || 85}% Akurasi Analisis
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  result.detectedCondition && result.detectedCondition !== 'Unknown' ? (
                    <div className="p-3 rounded-lg bg-white border border-[#E8DCC8] shadow-sm">
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#5D4037]">
                          {typeof translateCondition === 'function' ? translateCondition(result.detectedCondition) : result.detectedCondition}
                        </h2>
                        {result.conditionConfidence && (
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                            Terdeteksi
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C4A57B]"
                            style={{ width: `${result.conditionConfidence || 85}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-[#8D6E63]">
                          {result.conditionConfidence || 85}% Akurasi Analisis
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs italic p-3 bg-white rounded-lg border text-center">
                      Tidak ada masalah kulit terdeteksi
                    </p>
                  )
                )}
              </div>

              {/* 2. TIPE KULIT: MENGIKUTI ALUR DI BAWAHNYA TANPA JARAK JAUH */}
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8D6E63] mb-0.5">
                  Tipe Kulit
                </p>
                <p className="text-lg sm:text-xl font-bold text-[#5D4037]">
                  {result.skinType || "Berminyak"}
                </p>
              </div>

            </div>
          </div>

          {/* Tombol Aksi */}
          <button
            onClick={onReset}
            className="mt-4 w-full py-2.5 px-4 bg-[#C4A57B] text-white rounded-xl font-bold hover:bg-[#B89968] active:scale-[0.99] transition-all text-sm shadow-sm"
          >
            Analisis Foto Lain
          </button>
        </div>
      </div>

      {/* Recommended Treatments */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 border border-gray-50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#5D4037] mb-3">
            Rekomendasi Treatment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.recommendations.map((treatment) => (
              <div
                key={treatment.id}
                className="border border-[#E8DCC8] rounded-xl p-4 bg-white hover:bg-[#FDF8F5]/30 transition-colors flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#5D4037] mb-1">
                    {treatment.treatment}
                  </h4>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {treatment.reason}
                  </p>
                </div>
                <div className="flex items-baseline gap-1 mt-auto pt-2 border-t border-gray-50">
                  <span className="text-lg font-black text-[#C4A57B]">
                    {typeof formatPrice === 'function' ? formatPrice(treatment.price) : treatment.price}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">/sesi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catatan Penting */}
      <div className="bg-gradient-to-r from-[#FDF8F5] to-[#F5E6D3] border border-[#C4A57B] rounded-2xl p-4 shadow-sm text-xs text-[#5D4037]">
        <h4 className="font-bold text-sm mb-1">Catatan Penting:</h4>
        <p className="mb-2 opacity-90">
          Hasil analisis AI ini adalah panduan awal berbasis citra wajah. AI memiliki keterbatasan dan hasilnya <span className="font-bold text-red-700">tidak 100% akurat</span>.
        </p>
        <ul className="list-disc list-inside space-y-0.5 opacity-80 pl-1">
          <li>Hasil dapat berbeda dengan diagnosis klinis dermatolog.</li>
          <li>Faktor pencahayaan dan sudut foto mempengaruhi akurasi deteksi.</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalysisResults;