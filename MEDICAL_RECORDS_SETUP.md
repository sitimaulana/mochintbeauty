# MODUL REKAM MEDIS - SETUP & IMPLEMENTATION GUIDE

## 📋 Daftar Isi
1. [Setup Database](#setup-database)
2. [Backend API](#backend-api)
3. [Frontend Components](#frontend-components)
4. [Workflow & Features](#workflow--features)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)

---

## 🗄️ Setup Database

### 1. Jalankan Migration
Untuk membuat tabel `medical_records`, jalankan perintah berikut dari folder `server`:

```bash
cd server
node setup_medical_records.js
```

Atau manual dengan SQL:
```sql
-- Jalankan file create_medical_records_table.sql di database Anda
```

### 2. Verifikasi Tabel
```sql
DESC medical_records;
```

Tabel harus memiliki struktur berikut:
- `id` (INT, PK, AUTO_INCREMENT)
- `appointment_id` (INT, FK → appointments.id)
- `member_id` (INT, FK → members.id)
- `treatment_name` (VARCHAR 100)
- `medical_notes` (LONGTEXT)
- `before_image_url` (VARCHAR 500)
- `after_image_url` (VARCHAR 500)
- `images_json` (LONGTEXT) - JSON array untuk multiple images
- `diagnosis` (TEXT)
- `treatment_detail` (TEXT)
- `recommendations` (TEXT)
- `status` (ENUM: 'draft', 'completed')
- `created_at`, `updated_at` (TIMESTAMP)

---

## 🔌 Backend API

### Endpoints

#### 1. **GET** `/api/medical-records`
Mendapatkan semua medical records

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "appointment_id": 1,
      "member_id": 1,
      "treatment_name": "Facial Treatment",
      "medical_notes": "Kondisi kulit baik",
      "before_image_url": "/uploads/medical_records/photo-1.jpg",
      "after_image_url": "/uploads/medical_records/photo-2.jpg",
      "diagnosis": "Kulit sensitif",
      "status": "completed",
      "created_at": "2026-05-05T10:00:00Z"
    }
  ]
}
```

#### 2. **GET** `/api/medical-records/:id`
Mendapatkan medical record by ID

#### 3. **GET** `/api/medical-records/appointment/:appointmentId`
Mendapatkan medical record by appointment ID

**Usage:**
```javascript
// Frontend
const response = await axios.get(
  `/api/medical-records/appointment/${appointmentId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

#### 4. **GET** `/api/medical-records/member/:memberId`
Mendapatkan semua medical records dari member

#### 5. **GET** `/api/medical-records/member/:memberId/completed`
Mendapatkan medical records yang completed dari member

#### 6. **POST** `/api/medical-records` - CREATE dengan file upload

**Request Body (FormData):**
```javascript
const formData = new FormData();
formData.append('appointment_id', 1);
formData.append('member_id', 1);
formData.append('treatment_name', 'Facial Treatment');
formData.append('medical_notes', 'Catatan medis...');
formData.append('diagnosis', 'Diagnosis...');
formData.append('treatment_detail', 'Detail treatment...');
formData.append('recommendations', 'Rekomendasi...');
formData.append('status', 'completed');
formData.append('before_image', fileBeforeImage); // File object
formData.append('after_image', fileAfterImage);   // File object
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/medical-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "appointment_id=1" \
  -F "member_id=1" \
  -F "treatment_name=Facial" \
  -F "before_image=@/path/to/before.jpg" \
  -F "after_image=@/path/to/after.jpg"
```

#### 7. **PUT** `/api/medical-records/:id` - UPDATE dengan file upload

```javascript
const formData = new FormData();
formData.append('medical_notes', 'Updated notes...');
formData.append('status', 'completed');
// Optional: kirim gambar baru jika ingin update
formData.append('before_image', newBeforeImage);
```

#### 8. **PUT** `/api/medical-records/:id/status`

**Request Body:**
```json
{
  "status": "completed"
}
```

#### 9. **DELETE** `/api/medical-records/:id`

---

## 🎨 Frontend Components

### 1. Admin Medical Records Modal
**Path:** `src/components/admin/AdminMedicalRecordsModal.jsx`

**Props:**
```typescript
interface AdminMedicalRecordsModalProps {
  isOpen: boolean;              // Modal open state
  onClose: () => void;          // Close handler
  appointment: Appointment;     // Selected appointment
  onSuccess: (record) => void; // Success callback
  token: string;                // Auth token
}
```

**Usage:**
```jsx
import AdminMedicalRecordsModal from '../../components/admin/AdminMedicalRecordsModal';

// In component
<AdminMedicalRecordsModal
  isOpen={medicalRecordsModalOpen}
  onClose={closeMedicalRecordsModal}
  appointment={selectedAppointmentForMedical}
  onSuccess={handleMedicalRecordsSaved}
  token={Token}
/>
```

### 2. Member Medical Records View Modal
**Path:** `src/components/member/MemberMedicalRecordsModal.jsx`

**Props:**
```typescript
interface MemberMedicalRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicalRecord: MedicalRecord | null;
}
```

**Usage:**
```jsx
import MemberMedicalRecordsModal from '../../components/member/MemberMedicalRecordsModal';

<MemberMedicalRecordsModal
  isOpen={medicalRecordsModalOpen}
  onClose={closeMedicalRecordsModal}
  medicalRecord={selectedMedicalRecord}
/>
```

---

## 🔄 Workflow & Features

### Admin Side (Upload Medical Records)

1. **Ke halaman Admin Dashboard → Appointments**
2. **Klik tombol "📋 Medis"** pada appointment yang sudah completed
3. **Modal terbuka** untuk input rekam medis
4. **Isi form:**
   - Foto Sebelum Perawatan (Before)
   - Foto Setelah Perawatan (After)
   - Nama Treatment
   - Diagnosis
   - Detail Treatment
   - Catatan Medis
   - Rekomendasi Perawatan
5. **Pilih Status:** Draft atau Completed
6. **Klik "Simpan Rekam Medis"**
7. **Sistem menyimpan ke database** + **Upload gambar ke folder `/uploads/medical_records/`**

### Member Side (View Medical Records)

1. **Login → Dashboard Member**
2. **Buka halaman "Riwayat Perawatan"**
3. **Klik tombol "📋 Lihat Medis"** pada riwayat treatment
4. **Modal terbuka menampilkan:**
   - Foto Before & After (dengan preview)
   - Diagnosis
   - Detail Treatment
   - Catatan Medis
   - Rekomendasi Perawatan
   - Tombol Download untuk setiap foto

### File Upload

**Storage Location:**
- Server: `server/public/uploads/medical_records/`
- Public URL: `/uploads/medical_records/{filename}`

**Supported Formats:**
- JPEG, PNG, JPG, WEBP

**Max File Size:**
- 10MB per file

**Filename Generation:**
```javascript
// Format: {originalname}-{timestamp}-{randomnumber}.{ext}
// Contoh: facial-1717561200000-123456789.jpg
```

---

## 🧪 Testing Guide

### 1. Test Backend API

```bash
# 1. Create medical record
curl -X POST http://localhost:5000/api/medical-records \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "appointment_id=1" \
  -F "member_id=1" \
  -F "treatment_name=Perawatan Wajah" \
  -F "diagnosis=Kulit sensitif" \
  -F "treatment_detail=Facial + massage" \
  -F "medical_notes=OK" \
  -F "recommendations=Perawatan lanjutan 2 minggu" \
  -F "status=completed" \
  -F "before_image=@before.jpg" \
  -F "after_image=@after.jpg"

# 2. Get medical record by appointment
curl http://localhost:5000/api/medical-records/appointment/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get medical records by member
curl http://localhost:5000/api/medical-records/member/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Update medical record
curl -X PUT http://localhost:5000/api/medical-records/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "medical_notes=Updated notes" \
  -F "status=completed"

# 5. Delete medical record
curl -X DELETE http://localhost:5000/api/medical-records/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Frontend - Admin

**Steps:**
1. Login as admin
2. Go to Appointments page
3. Find completed appointment
4. Click "📋 Medis" button
5. Fill in form with test data
6. Upload before/after images
7. Click "Simpan Rekam Medis"
8. Verify notification shows success
9. Refresh page and verify data persists

### 3. Test Frontend - Member

**Steps:**
1. Login as member
2. Go to History/Riwayat Perawatan page
3. Click "📋 Lihat Medis" button on any history item
4. Verify modal opens with medical record data
5. Verify images display correctly
6. Test image download functionality
7. Test modal close functionality

### 4. Test Edge Cases

```javascript
// Test: Medical record tidak ditemukan
GET /api/medical-records/appointment/999

// Test: Invalid appointment ID
POST /api/medical-records
Body: { appointment_id: 999 }

// Test: File too large
POST /api/medical-records
Body: {FormData dengan file > 10MB}

// Test: Invalid file type
POST /api/medical-records
Body: {FormData dengan file .pdf}

// Test: Update non-existent record
PUT /api/medical-records/999
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)

```env
# Upload folder configuration
UPLOAD_DIR=./public/uploads/medical_records
MAX_FILE_SIZE=10485760  # 10MB in bytes

# API
MEDICAL_RECORDS_API_URL=/api/medical-records
```

### Database Connection

Pastikan database sudah terhubung di `server/config/database.js`:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beauty_clinic',
  ...
});
```

---

## 🐛 Troubleshooting

### Error: "Medical record not found"
**Solusi:**
- Verifikasi appointment_id benar
- Pastikan medical record sudah dibuat admin
- Check database query

### Error: "Failed to upload file"
**Solusi:**
- Check folder permissions: `chmod 755 server/public/uploads/medical_records/`
- Pastikan folder exists: `mkdir -p server/public/uploads/medical_records/`
- Verify file size < 10MB
- Supported formats: jpeg, png, jpg, webp

### Error: "Token not found"
**Solusi:**
- Pastikan user sudah login
- Check localStorage.getItem('token')
- Verify JWT token masih valid

### Error: "CORS error"
**Solusi:**
- Verify CORS configuration di `server/server.js`
- Check request origin header

### Images tidak ditampilkan
**Solusi:**
- Verify image URL di response: `/uploads/medical_records/filename.jpg`
- Check static files serving: `app.use(express.static())`
- Verify file exists di folder upload

### Modal tidak terbuka
**Solusi:**
- Check browser console untuk errors
- Verify state management di component
- Check API call success

### Form tidak save
**Solusi:**
- Verify FormData dikonstruksi dengan benar
- Check network request di browser DevTools
- Verify server logs

---

## 📝 API Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200  | ✅ OK | Request successful |
| 201  | ✅ Created | Medical record created |
| 400  | ❌ Bad Request | Invalid data |
| 401  | ❌ Unauthorized | Token missing/invalid |
| 404  | ❌ Not Found | Resource not found |
| 413  | ❌ Payload Too Large | File too large |
| 500  | ❌ Server Error | Internal error |

---

## 📚 Database Queries Referensi

```sql
-- View all medical records with joined data
SELECT mr.*, a.appointment_id, a.customer_name, 
       m.name as member_name, t.name as treatment_name
FROM medical_records mr
LEFT JOIN appointments a ON mr.appointment_id = a.id
LEFT JOIN members m ON mr.member_id = m.id
LEFT JOIN treatments t ON mr.treatment_id = t.id
ORDER BY mr.created_at DESC;

-- Get medical records count by status
SELECT status, COUNT(*) as total
FROM medical_records
GROUP BY status;

-- Get storage usage
SELECT SUM(file_size) as total_size
FROM medical_records_files
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH);
```

---

## 🎯 Next Steps

1. **Monitor Storage:** Track upload folder size regularly
2. **Backup Data:** Implement backup untuk images
3. **Performance:** Consider CDN untuk image delivery
4. **Security:** Implement image access control
5. **Analytics:** Track medical records usage

---

Generated: 2026-05-05
Last Updated: 2026-05-05
