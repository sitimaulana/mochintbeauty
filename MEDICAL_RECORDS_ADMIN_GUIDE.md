# 📋 ADMIN MEDICAL RECORDS - QUICK START GUIDE

## Bagaimana Data Tersimpan dari Member ke Admin?

### Flow Proses:

```
1. MEMBER UPLOAD FOTO
   ├─ Member membuka Janji Temu di aplikasi member
   ├─ Member klik tombol "Foto Before"
   ├─ Modal MemberBeforePhotoUpload terbuka
   ├─ Member upload foto dari kamera atau galeri
   └─ Foto di-upload ke backend

2. FOTO TERSIMPAN KE DATABASE
   ├─ Foto file disimpan di: server/public/uploads/medical_records/
   ├─ Data medical record disimpan di table: medical_records
   ├─ Fields yang tersimpan:
   │  ├─ appointment_id ✅
   │  ├─ member_id ✅
   │  ├─ treatment_name ✅
   │  ├─ before_image_url (URL foto) ✅
   │  ├─ status: 'draft' ✅
   │  └─ created_at ✅
   └─ Response dikirim ke member dengan success message

3. ADMIN LIHAT DATA
   ├─ Admin buka halaman: /admin/medical-records
   ├─ Semua medical records tampil dalam table
   ├─ Admin bisa:
   │  ├─ ✅ Search berdasarkan nama member/treatment
   │  ├─ ✅ Filter berdasarkan status (draft/pending/completed)
   │  ├─ ✅ Lihat foto before/after
   │  ├─ ✅ Klik "Lihat" untuk detail lengkap
   │  └─ ✅ Download/buka foto dalam ukuran penuh
   └─ Admin bisa edit/add after photo dari appointment page
```

---

## 🎯 Fitur-Fitur Admin Medical Records

### 1️⃣ List Medical Records
- **Lokasi**: Admin > Sidebar > Rekam Medis
- **Menampilkan**:
  - Nama Member
  - Treatment yang dilakukan
  - Icon foto (Before/After jika ada)
  - Status rekam medis
  - Tanggal dibuat

### 2️⃣ Search & Filter
- **Search**: Cari berdasarkan nama member, email, atau treatment
- **Filter Status**:
  - **Draft** (kuning) - Baru di-upload, belum diproses
  - **Pending** (biru) - Sedang diproses
  - **Completed** (hijau) - Selesai

### 3️⃣ Detail View
- Klik tombol "Lihat" untuk membuka detail modal
- **Menampilkan**:
  - Informasi member lengkap
  - Catatan medis
  - Diagnosis
  - Detail treatment
  - Rekomendasi
  - **Foto Before/After** (bisa di-preview dan buka fullsize)

### 4️⃣ Manage dari Appointment
- Admin juga bisa manage medical records dari halaman Janji Temu
- Setiap appointment punya tombol "Manage Medical Records"
- Dari sini admin bisa:
  - Lihat yang sudah di-upload member
  - Tambah/edit catatan medis
  - Upload foto after treatment

---

## 📝 Data Fields yang Tersimpan

```
medical_records table:
├─ id: INT (primary key)
├─ appointment_id: INT ← Appointment yang ditindaklanjuti
├─ member_id: INT ← Pasien
├─ treatment_name: VARCHAR ← Nama treatment
├─ medical_notes: TEXT ← Catatan medis
├─ before_image_url: VARCHAR ← URL foto sebelum ✅ (dari member)
├─ after_image_url: VARCHAR ← URL foto sesudah (biasanya dari admin)
├─ images_json: JSON ← Detail foto (type, filename, upload time)
├─ diagnosis: TEXT ← Diagnosis
├─ treatment_detail: TEXT ← Detail treatment yang dilakukan
├─ recommendations: TEXT ← Rekomendasi
├─ status: ENUM (draft/pending/completed)
├─ created_at: TIMESTAMP
└─ updated_at: TIMESTAMP
```

---

## 🔄 Workflow Lengkap

### Step-by-Step:

#### 1. **Member Upload Foto Before**
```
Member App:
  ✓ Janji Temu > Detail Appointment
  ✓ Klik "Foto Before"
  ✓ Modal terbuka
  ✓ Pilih: Kamera atau Galeri
  ✓ Upload foto
  ✓ Success! ✅
```

#### 2. **Data Tersimpan di Backend**
```
Backend proses:
  ✓ Terima FormData dengan foto
  ✓ Validasi file (size, type)
  ✓ Save file ke: public/uploads/medical_records/
  ✓ Insert record ke medical_records table
  ✓ Update appointment.has_medical_records = true
  ✓ Return success response
```

#### 3. **Admin Lihat Data**
```
Admin Panel:
  ✓ Login ke admin
  ✓ Menu > Rekam Medis
  ✓ Lihat daftar medical records
  ✓ Foto dari member tampil di kolom "Foto"
  ✓ Klik "Lihat" untuk detail
  ✓ Preview foto before dari member
```

#### 4. **Admin Add After Photo & Finalkan**
```
Admin Panel - Detail atau dari Appointment:
  ✓ Dari appointment, klik "Manage Medical Records"
  ✓ Form terbuka dengan data yang sudah ada
  ✓ Foto before dari member sudah visible
  ✓ Admin bisa add foto after treatment
  ✓ Admin bisa edit catatan/diagnosis/rekomendasi
  ✓ Ubah status jadi "completed"
  ✓ Save ✅
```

---

## 🐛 Troubleshooting

### Issue: Member foto tidak tersimpan
**Solusi:**
- ✅ Pastikan kamera sudah di-izinkan
- ✅ Cek ukuran foto (max 5MB)
- ✅ Cek browser console untuk error
- ✅ Pastikan backend running

### Issue: Admin tidak bisa lihat foto
**Solusi:**
- ✅ Cek URL di AdminMedicalRecordsModal (should start with `/uploads/`)
- ✅ Pastikan folder `public/uploads/medical_records/` ada
- ✅ Pastikan file permissions correct

### Issue: Upload gagal 500 error
**Solusi:**
- ✅ Check server logs
- ✅ Pastikan member_id valid
- ✅ Pastikan appointment_id valid
- ✅ Pastikan FormData terformat benar (no Content-Type header)

---

## 📊 API Endpoints

```
GET /api/medical-records
  → Get semua medical records

GET /api/medical-records/appointment/:appointmentId
  → Get medical record untuk appointment tertentu

POST /api/medical-records
  → Create medical record (multipart/form-data with file)
  ✅ Dipakai saat member upload foto

PUT /api/medical-records/:id
  → Update medical record (multipart/form-data)
  ✅ Dipakai saat admin add after photo

DELETE /api/medical-records/:id
  → Delete medical record
```

---

## ✅ Checklist - Pastikan Semua Setup Benar

- [ ] Member bisa upload foto dari appointment detail
- [ ] Foto tampil di admin > Rekam Medis
- [ ] Admin bisa lihat detail dan preview foto
- [ ] Admin bisa add after photo dari Appointment
- [ ] Status bisa berubah dari draft → completed
- [ ] Search dan filter bekerja dengan baik
- [ ] Folder uploads ada dan writable: `server/public/uploads/medical_records/`

---

**Last Updated**: May 13, 2026
**Version**: 1.0
