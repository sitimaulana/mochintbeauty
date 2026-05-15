# 📋 Medical Records System - Integration Guide

## 🎯 Pertanyaan Awal Anda

> "Alur dari sistem rekam medis adalah member mengunggah foto... lantas mengapa ada page medical record(rekam medis) di admin? Selain itu databasenya juga belum tersambung!"

**Status: ✅ SUDAH DIPERBAIKI!**

---

## 📊 Alur Sistem yang Benar

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMBER - Upload Foto                          │
├─────────────────────────────────────────────────────────────────┤
│  Appointment Detail page → Klik "Foto Sebelum Perawatan"         │
│  ↓                                                                │
│  Upload dari kamera/galeri → MemberBeforePhotoUpload modal       │
│  ↓                                                                │
│  POST /api/medical-records → Create medical record (status: draft)
│  ↓                                                                │
│  💾 Tersimpan di Database                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────────────────────┐
            │   DATABASE - medical_records   │
            │   (12 records sudah tersimpan) │
            └───────────────────────────────┘
                   ↙ Connection ↘
┌────────────────────────────┐  ┌──────────────────────────────┐
│  ADMIN - Appointment Page  │  │ ADMIN - Medical Records Page │
│                            │  │                              │
│  👉 NEW: Badge count       │  │ - Lihat semua records        │
│     medical records per    │  │ - Edit/complete records      │
│     appointment            │  │ - Upload additional images   │
│  - Klik "📋 Medis"        │  │ - Print/Export               │
│  - Lihat detail records    │  │                              │
│  - Complete status         │  │                              │
└────────────────────────────┘  └──────────────────────────────┘
```

---

## ✅ Database Sudah Terhubung

### Struktur Table
```sql
medical_records (medical_records table)
├── id (PRIMARY KEY)
├── appointment_id (FK) → appointments table
├── member_id (FK) → members table
├── treatment_name
├── medical_notes
├── before_image_url
├── after_image_url
├── images_json
├── diagnosis
├── treatment_detail
├── recommendations
├── status (ENUM: 'draft', 'completed')
├── created_at
└── updated_at
```

### Data Saat Ini
- ✅ **12 medical records** sudah tersimpan
- ✅ **2 appointments** terhubung dengan medical records:
  - Appointment APT00001 (Nana): 7 records
  - Appointment APT00002 (Nana): 5 records

---

## 🔧 Integrasi Baru yang Ditambahkan

### 1️⃣ API Endpoint Baru
**GET** `/api/medical-records/appointment/:appointmentId/count`

Fungsi: Hitung jumlah medical records untuk satu appointment

Contoh Response:
```json
{
  "success": true,
  "data": {
    "appointmentId": 37,
    "count": 7,
    "hasRecords": true
  }
}
```

**File yang ditambah/dimodifikasi:**
- ✏️ [server/routes/medicalRecordRoutes.js](server/routes/medicalRecordRoutes.js#L61-L63)
- ✏️ [server/controllers/medicalRecordController.js](server/controllers/medicalRecordController.js#L418-L445) (tambah method `getMedicalRecordCountByAppointment`)
- ✏️ [server/models/MedicalRecord.js](server/models/MedicalRecord.js#L209-L215) (tambah method `countByAppointmentId`)

### 2️⃣ Frontend - Appointment Component Update
**Fitur Baru:** Badge count di button medical records

```jsx
// State baru untuk tracking count per appointment
const [medicalRecordsCounts, setMedicalRecordsCounts] = useState({});

// Function baru untuk fetch count
const fetchMedicalRecordsCounts = async (appointmentsData) => {
  // Fetch count untuk setiap appointment
  // Update state dengan hasil count
}

// Button dengan badge count
<button onClick={() => openMedicalRecordsModal(app)}>
  📋 Medis
  {medicalRecordsCounts[app.id] > 0 && (
    <span className="badge">{medicalRecordsCounts[app.id]}</span>
  )}
</button>
```

**File yang dimodifikasi:**
- ✏️ [src/pages/admin/Appointment.jsx](src/pages/admin/Appointment.jsx)
  - Line 86: Tambah state `medicalRecordsCounts`
  - Line 152-169: Tambah function `fetchMedicalRecordsCounts()`
  - Line 141: Call `fetchMedicalRecordsCounts()` di `fetchAllData()`
  - Line 1015-1020: Update button dengan badge count

---

## 🎬 Cara Kerja Sistem

### Skenario: Member Upload Foto

1. **Member membuka Appointment Detail**
   - URL: `/member/appointment/{id}`
   - Lihat tombol "📸 Foto Sebelum Perawatan"

2. **Member klik tombol upload**
   - Modal `MemberBeforePhotoUpload` terbuka
   - Pilih: Kamera atau Galeri
   - Upload foto dengan `before_image`

3. **Photo dikirim ke server**
   ```
   POST /api/medical-records
   Body: FormData
   - appointment_id
   - member_id
   - treatment_name
   - status: "draft"
   - before_image: File
   ```

4. **Server create medical record**
   - Simpan file ke: `/server/public/uploads/medical_records/`
   - Insert record ke table `medical_records`
   - Return URL dan data record

5. **Member melihat status di Appointment**
   - Appointment status tetap (tidak berubah otomatis)
   - Medical record tersimpan dengan status "draft"

---

### Skenario: Admin Review Medical Records

1. **Admin buka Appointment page**
   - URL: `/admin/appointment`
   - System fetch semua appointments
   - **NEW**: Fetch medical records count untuk setiap appointment

2. **Admin melihat badge count**
   - Button "📋 Medis" menampilkan badge dengan jumlah records
   - Contoh: `📋 Medis [7]` = ada 7 medical records

3. **Admin klik button medical records**
   - Modal `AdminMedicalRecordsModal` terbuka
   - Lihat semua records untuk appointment tersebut
   - Edit/complete status
   - Upload after photos
   - Tambah diagnosis, treatment detail, recommendations

4. **Admin update status record ke "completed"**
   - Perubahan hanya di medical record, bukan appointment
   - Appointment status tetap diupdate manual via "Selesai" button

---

## 📱 Fitur yang Sudah Ada (Jangan Dihapus!)

### Di Member Side
- ✅ Upload foto sebelum perawatan via AppointmentDetail
- ✅ Lihat appointment history
- ✅ Lihat medical records yang sudah dibuat (di History page)

### Di Admin Side
- ✅ Page "Medical Records" untuk lihat semua records
- ✅ Filter, search, edit, delete records
- ✅ Complete records dengan status
- ✅ Upload after photos
- ✅ Tambah diagnosis, treatment detail, recommendations
- ✅ **NEW**: Badge count di Appointment page
- ✅ **NEW**: Fetch count otomatis saat load appointments

---

## 🐛 Troubleshooting

### Problem: Badge count tidak muncul
**Solusi:**
1. Pastikan server running
2. Check console untuk error messages
3. Verify token valid
4. Clear browser cache

### Problem: Upload foto dari member tidak muncul
**Solusi:**
1. Check uploads directory: `server/public/uploads/medical_records/`
2. Verify database: `SELECT * FROM medical_records WHERE appointment_id = ?`
3. Check file permissions

### Problem: API endpoint 404
**Solusi:**
1. Verify routes di `medicalRecordRoutes.js`
2. Check route path: `/api/medical-records/appointment/{appointmentId}/count`
3. Restart server

---

## 📝 Development Notes

### API Endpoints yang Tersedia
```
GET    /api/medical-records                                    - Get all
GET    /api/medical-records/:id                                - Get by ID
GET    /api/medical-records/appointment/:appointmentId         - Get by appointment
GET    /api/medical-records/appointment/:appointmentId/count   - 🆕 Count by appointment
GET    /api/medical-records/member/:memberId                   - Get by member
GET    /api/medical-records/member/:memberId/completed         - Get completed
POST   /api/medical-records                                    - Create (with upload)
PUT    /api/medical-records/:id                                - Update (with upload)
PUT    /api/medical-records/:id/status                         - Update status
DELETE /api/medical-records/:id                                - Delete
```

### Database Queries
```sql
-- Count medical records per appointment
SELECT COUNT(*) as count FROM medical_records WHERE appointment_id = ?

-- Get appointments dengan jumlah records
SELECT 
  a.id,
  a.appointment_id,
  COUNT(mr.id) as medical_record_count
FROM appointments a
LEFT JOIN medical_records mr ON a.id = mr.appointment_id
GROUP BY a.id
```

### Upload Directory
```
server/
└── public/
    └── uploads/
        └── medical_records/
            ├── before_photo_1715637871234-123456789.jpg
            └── after_photo_1715637894123-987654321.jpg
```

---

## ✨ Testing Checklist

- [ ] Member bisa upload foto di Appointment Detail
- [ ] Foto tersimpan di database medical_records
- [ ] File tersimpan di `/server/public/uploads/medical_records/`
- [ ] Admin buka Appointment page → badge count muncul
- [ ] Admin bisa buka modal medical records dari button
- [ ] Admin bisa complete/edit records
- [ ] Page Medical Records menampilkan semua records
- [ ] Filter dan search berfungsi di Medical Records page
- [ ] Upload after photos berfungsi

---

## 📞 Reference Files

Modified/Created Files:
1. `server/routes/medicalRecordRoutes.js` - Added new route
2. `server/controllers/medicalRecordController.js` - Added new controller method
3. `server/models/MedicalRecord.js` - Added count method
4. `src/pages/admin/Appointment.jsx` - Added count fetch & badge display
5. `server/test_medical_records_db.js` - Database test (new)
6. `server/test_api_endpoints.js` - API test (new)

