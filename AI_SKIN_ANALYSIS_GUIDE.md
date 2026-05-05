# AI Skin Analysis - Frontend Implementation Guide

## 📋 Overview

Halaman AI Skin Analysis telah dibuat dengan antarmuka lengkap untuk:
- Upload foto wajah pelanggan
- Preview gambar yang diupload
- Menampilkan hasil analisis kulit
- Menampilkan rekomendasi treatment berdasarkan hasil analisis

## 🗂️ Struktur File

```
src/pages/public/
├── AISkinAnalysis.jsx          # Main page component
└── (Komponen terintegrasi dalam satu file)
```

## 📍 Route

- **URL**: `/ai-skin-analysis`
- **Navigation**: Menu navbar "AI Skin Analysis"
- **Layout**: PublicLayout (tersedia untuk semua user)

## 🎨 UI Features

### Sebelum Upload
- Upload area dengan drag & drop support
- Tips fotografi untuk hasil terbaik
- Limit ukuran file: 5MB
- Format yang didukung: JPG, PNG, WebP

### Setelah Upload
- Preview foto yang diupload
- Tombol "Analisis Kulit Saya" untuk memulai proses
- Loading state selama proses analisis

### Hasil Analisis
- Tipe kulit yang terdeteksi
- Confidence score (0-100%)
- Daftar masalah kulit dengan severity level (ringan/sedang/berat)
- Rekomendasi treatment dengan:
  - Nama treatment
  - Penjelasan alasan rekomendasi
  - Harga per sesi
  - Tombol booking

## 🔧 Backend Integration

### Saat ini (Mock Data)
Aplikasi menggunakan mock data untuk mendemonstrasikan UI. Data mock disimpan di dalam component dengan struktur:

```javascript
const mockResult = {
  skinType: 'Kombinasi',
  skinCondition: [
    { issue: 'Komedo', severity: 'sedang', color: 'yellow' },
    // ... more conditions
  ],
  recommendations: [
    {
      id: 1,
      treatment: 'Facial HydraFacial',
      reason: 'Untuk membersihkan pori-pori dan menghilangkan komedo',
      price: 350000
    },
    // ... more treatments
  ],
  confidence: 87
};
```

### Untuk Integrasi Backend (TODO)

1. **Update handleAnalyze function** di `AISkinAnalysis.jsx` (baris ~100):

```javascript
const handleAnalyze = async () => {
  // ... validasi existing code ...
  
  setIsAnalyzing(true);
  setError(null);

  try {
    // Buat FormData untuk upload
    const formData = new FormData();
    formData.append('image', uploadedImage);

    // Panggil API AI backend
    const response = await axios.post('/api/ai/analyze-skin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Response diharapkan struktur:
    // {
    //   skinType: string,
    //   skinCondition: array,
    //   recommendations: array,
    //   confidence: number
    // }

    setAnalysisResult(response.data);
    setShowResults(true);
  } catch (err) {
    setError('Gagal menganalisis foto. Silakan coba lagi.');
    console.error('Error analyzing image:', err);
  } finally {
    setIsAnalyzing(false);
  }
};
```

2. **Backend Response Expected Format**:

```json
{
  "skinType": "Kombinasi",
  "skinCondition": [
    {
      "issue": "string (nama masalah kulit)",
      "severity": "ringan|sedang|berat",
      "color": "string (unused, untuk future UI enhancement)"
    }
  ],
  "recommendations": [
    {
      "id": "number",
      "treatment": "string (nama treatment)",
      "reason": "string (penjelasan mengapa treatment ini direkomendasikan)",
      "price": "number (harga dalam Rupiah)"
    }
  ],
  "confidence": "number (0-100, tingkat kepercayaan analisis)"
}
```

3. **Tombol Booking**:
   - Saat ini tombol booking tidak melakukan apa-apa
   - Dapat diintegrasikan dengan sistem booking yang sudah ada di `/member/booking/step-1`
   - Atau membuat flow booking khusus dengan treatment yang sudah dipilih

## 🎯 Skin Type Categories

Kategori tipe kulit yang dapat digunakan:
- Oily (Berminyak)
- Dry (Kering)
- Combination (Kombinasi)
- Sensitive (Sensitif)
- Normal (Normal)

## 🐛 Skin Condition Severity Levels

```
- ringan: Warna kuning, masalah minor
- sedang: Warna orange, masalah moderate
- berat: Warna merah, masalah signifikan
```

## 📱 Responsiveness

- Desktop: 2-column layout (image + tips, atau image + results)
- Tablet: Responsive grid
- Mobile: Single column, stacked layout

## ♿ Accessibility

- Tombol dengan aria labels
- Error messages dengan icon feedback
- Clear visual hierarchy
- Keyboard navigable

## 🚀 Future Enhancements

1. **AI Integration**: Ganti mock data dengan actual AI model
2. **Before/After**: Tampilkan hasil treatment yang pernah dilakukan
3. **History**: Simpan history analisis untuk tracking progress
4. **Sharing**: Bagikan hasil analisis via social media
5. **Personalized Plan**: Buat treatment plan yang dipersonalisasi
6. **Video Guide**: Tutorial cara mengambil foto terbaik
7. **Reminder**: Reminder untuk treatment follow-up

## 📞 Support

Untuk pertanyaan atau bantuan integrasi, hubungi tim development.
