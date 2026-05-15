# 📸 Admin Medical Records Camera Upload Feature

## Overview
Admin sekarang dapat mengupload foto "Before" dan "After" untuk medical records melalui:
- **Kamera langsung** (smartphone/webcam)
- **Upload file** (dari galeri/file manager)

Fitur ini sama dengan yang sudah tersedia untuk user members.

## 🎯 Fitur-Fitur Baru

### 1. **Foto Before dengan Opsi Camera/File**
- Admin bisa pilih "Foto dari Kamera" untuk ambil langsung
- Admin bisa pilih "Upload dari Galeri" untuk browse file
- Bisa ganti kamera (front ↔ back) dengan tombol "Ganti Kamera"
- Preview foto sebelum save

### 2. **Foto After dengan Opsi Camera/File**
- Sama seperti foto before
- Support multiple camera devices

### 3. **Flow Penggunaan**
```
1. Admin buka modal "Tambah/Update Rekam Medis" dari Appointment
2. Lihat 2 section: "Foto Sebelum Perawatan" dan "Foto Setelah Perawatan"
3. Untuk setiap foto:
   - Klik tombol "Foto dari Kamera" 
     → Video stream akan tampil
     → Klik "Ambil Foto" untuk capture
   - ATAU klik tombol "Upload dari Galeri"
     → File picker akan terbuka
     → Pilih foto dari device
4. Preview tampil
5. Bisa "Ganti Foto" atau lanjut
6. Klik "Simpan Rekam Medis" untuk save
```

## 🔧 Technical Details

### Modified Component
- **File**: `src/components/admin/AdminMedicalRecordsModal.jsx`

### Changes Made

#### 1. **Imports**
```javascript
import { Camera, RefreshCw } from 'lucide-react';  // New icons
import { useRef } from 'react';  // For refs
```

#### 2. **New State Variables**
```javascript
// Before image camera
- beforeCameraActive
- beforeUploadMode
- beforeFacingMode
- beforeCameraLoading

// After image camera
- afterCameraActive
- afterUploadMode
- afterFacingMode
- afterCameraLoading
```

#### 3. **New Refs**
```javascript
- beforeCameraRef
- afterCameraRef
- beforeCanvasRef
- afterCanvasRef
- beforeFileInputRef
- afterFileInputRef
```

#### 4. **New Functions**
- `startBeforeCamera()` - Initialize camera for before photo
- `stopBeforeCamera()` - Stop camera stream
- `switchBeforeCamera()` - Toggle between front/back camera
- `captureBeforePhoto()` - Capture photo from camera
- `resetBeforeUpload()` - Reset upload state

- `startAfterCamera()` - Initialize camera for after photo
- `stopAfterCamera()` - Stop camera stream
- `switchAfterCamera()` - Toggle between front/back camera
- `captureAfterPhoto()` - Capture photo from camera
- `resetAfterUpload()` - Reset upload state

#### 5. **New Effects**
- Auto-start camera when `beforeUploadMode === 'camera'`
- Auto-stop camera on cleanup
- Auto-start camera when `afterUploadMode === 'camera'`
- Auto-stop camera on cleanup

### Backend Support
Backend sudah support file upload lewat:
- POST `/api/medical-records` (create)
- PUT `/api/medical-records/{id}` (update)

**Storage**: `server/public/uploads/medical_records/`

## 🎮 UI/UX Features

### Mode Selection Screen
```
┌─────────────────────────────┐
│  📸 Foto dari Kamera        │
│  Ambil foto langsung        │
└─────────────────────────────┘

┌─────────────────────────────┐
│  📁 Upload dari Galeri       │
│  Pilih foto dari device     │
└─────────────────────────────┘
```

### Camera Screen
```
┌─────────────────────────────┐
│    [Video Stream]           │
│    ┌─────────────┐           │
│    │ ⚠️ Kamera   │           │
│    │ Perlu izin  │           │
│    └─────────────┘           │
└─────────────────────────────┘

Buttons:
- [🔄 Ganti Kamera] [📸 Ambil Foto]
- [Batal]
```

### Photo Preview
```
┌─────────────────────────────┐
│    [Photo Preview]          │
│    ┌───────────────┐         │
│    │ [Photo Image] │  [✕]    │
│    └───────────────┘         │
└─────────────────────────────┘

Buttons:
- [Ganti Foto]
```

## ✅ Validations

### File Validation
- ✅ Max file size: 10MB
- ✅ File type: Image only (JPG, PNG, WebP, etc)
- ✅ Canvas size: Minimum 320x240

### Camera Validation
- ✅ Browser support check
- ✅ Camera permission check
- ✅ Device compatibility (front/back camera)
- ✅ Video stream readiness

## 🔐 Error Handling

### Camera Errors
- ❌ NotAllowedError → "Izin kamera ditolak"
- ❌ NotFoundError → "Kamera tidak ditemukan"
- ❌ NotReadableError → "Kamera sedang digunakan"
- ❌ Timeout → "Kamera timeout"

### File Upload Errors
- ❌ File > 10MB → "File size harus < 10MB"
- ❌ Non-image file → "Upload file gambar saja"

## 🧪 Testing Checklist

- [ ] Admin bisa upload foto before lewat kamera
- [ ] Admin bisa ganti camera (front/back)
- [ ] Admin bisa ambil ulang foto (Ambil Ulang)
- [ ] Admin bisa upload foto before lewat file
- [ ] Admin bisa upload foto after lewat kamera
- [ ] Admin bisa upload foto after lewat file
- [ ] Foto tampil di preview sebelum save
- [ ] Bisa ganti foto setelah dipilih
- [ ] Save medical records dengan 2 foto berfungsi
- [ ] Existing records bisa di-update dengan foto baru
- [ ] Error messages tampil dengan jelas
- [ ] Camera permissions diminta dengan baik
- [ ] Works on mobile browser
- [ ] Works on desktop browser
- [ ] Works on tablet

## 🚀 Usage Example

```javascript
// Admin Component sudah terintegrasi
// Cukup trigger modal AdminMedicalRecordsModal dengan:
<AdminMedicalRecordsModal
  isOpen={isOpen}
  onClose={handleClose}
  appointment={appointment}
  onSuccess={handleSuccess}
  token={token}
/>
```

## 📱 Browser Compatibility

Works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS 14.5+)
- ✅ Mobile browsers (Android Chrome, Safari iOS)

Requires:
- ✅ HTTPS (for camera access)
- ✅ Browser permission for camera
- ✅ Modern browser with MediaDevices API

## 🔄 Integration Points

### From Appointment.jsx
```javascript
// Saat admin klik "Manage Medical Records" button
const openMedicalRecordsModal = (appointment) => {
  setSelectedAppointmentForMedical(appointment);
  setMedicalRecordsModalOpen(true);
};

<AdminMedicalRecordsModal
  isOpen={medicalRecordsModalOpen}
  onClose={closeMedicalRecordsModal}
  appointment={selectedAppointmentForMedical}
  onSuccess={handleMedicalRecordsSaved}
  token={Token}
/>
```

## 📝 Notes

- Foto dicapture dalam format JPEG dengan quality 1.0
- Filename auto-generated: `before_photo_${timestamp}.jpg`
- Canvas drawing fallback untuk edge cases
- Camera stream auto-cleanup saat modal ditutup
- Multiple state management untuk two independent cameras

## 🐛 Known Limitations

- Hanya 1 kamera bisa active at a time (before atau after)
- Canvas blur jika device tidak mendukung constraint ideal
- Fallback ke relaxed constraints jika strict constraints fail

---

**Last Updated**: May 15, 2026
**Version**: 1.0
