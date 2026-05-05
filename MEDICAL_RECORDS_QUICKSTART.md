# MODUL REKAM MEDIS - QUICK START GUIDE

## 🚀 Mulai Dengan Cepat

### Step 1: Setup Database (Server Side)
```bash
cd server
node setup_medical_records.js
```

Jika berhasil, akan tampil:
```
🔄 Creating medical_records table...
✅ medical_records table created successfully
✨ Migration complete
```

### Step 2: Verifikasi Instalasi

**Di Admin Page:**
1. Login sebagai admin
2. Buka menu Appointments
3. Cari appointment dengan status "confirmed" atau "completed"
4. Klik tombol "📋 Medis" (warna ungu)
5. Modal harus terbuka dengan form kosong

**Di Member Page:**
1. Login sebagai member
2. Buka menu "Riwayat Perawatan"
3. Klik tombol "📋 Lihat Medis"
4. Jika belum ada data → alert "Rekam medis belum tersedia"

---

## 👨‍💼 Admin: Upload Rekam Medis

### Langkah Demi Langkah

**1. Pilih Appointment**
- Go to: **Admin Dashboard → Appointments**
- Cari appointment dengan status ✓ Completed atau 📋 Confirmed
- Klik tombol **"📋 Medis"** (di kolom terakhir)

**2. Modal Terbuka**
- Terlihat informasi appointment
- Form kosong siap diisi

**3. Upload Foto**
- Klik kotak **"Foto Sebelum Perawatan"**
- Pilih file JPG/PNG (max 10MB)
- Preview muncul
- Ulangi untuk **"Foto Setelah Perawatan"**

**4. Isi Data**
```
✓ Nama Treatment: "Facial Premium"
✓ Diagnosis: "Kulit sensitif, ada jerawat"
✓ Detail Treatment: "Cleansing, massage, masker"
✓ Catatan Medis: "Pasien merasa nyaman, hasil memuaskan"
✓ Rekomendasi: "Perawatan lanjutan 2 minggu"
✓ Status: "Completed"
```

**5. Simpan**
- Klik **"Simpan Rekam Medis"**
- Tunggu hingga loading selesai
- Notifikasi hijau muncul: **"Rekam medis berhasil disimpan!"**

✅ **Selesai!** Foto & data sudah tersimpan di database

---

## 👥 Member: Lihat Rekam Medis

### Langkah Demi Langkah

**1. Buka History**
- Go to: **Member Dashboard → Riwayat Perawatan**
- Atau click: **"Lihat Reservasi"** di booking success page

**2. Cari Treatment**
- Scroll cari perawatan yang sudah selesai ✓
- Di setiap row ada tombol **"📋 Lihat Medis"**

**3. Buka Modal**
- Klik **"📋 Lihat Medis"**
- Modal terbuka menampilkan data lengkap

**4. Lihat Detail**
Setiap section bisa di-expand:
- 📷 **Foto Hasil Perawatan** - Before & After
- 🏥 **Diagnosis** - Kondisi kulit saat itu
- ✨ **Detail Treatment** - Apa yang dilakukan
- 📝 **Catatan Medis** - Observasi dokter
- 💡 **Rekomendasi** - Treatment selanjutnya

**5. Download Foto**
- Hover di atas foto
- Tombol download muncul
- Klik untuk download ke device

**6. Preview Foto**
- Klik foto untuk preview fullscreen
- Klik background untuk close

---

## 📊 Data Flow Diagram

```
ADMIN SIDE
┌─────────────────────────────────────────┐
│ Admin Dashboard → Appointments          │
├─────────────────────────────────────────┤
│ Klik "📋 Medis" pada appointment        │
├─────────────────────────────────────────┤
│ AdminMedicalRecordsModal (form)         │
├─────────────────────────────────────────┤
│ Upload Images + Isi Form                │
├─────────────────────────────────────────┤
│ POST /api/medical-records               │
├─────────────────────────────────────────┤
│ ✅ Saved to Database + Uploaded Images  │
└─────────────────────────────────────────┘
                    ↓↓↓
              DATABASE SYNC
                    ↓↓↓
┌─────────────────────────────────────────┐
│ Member Dashboard → Riwayat Perawatan    │
├─────────────────────────────────────────┤
│ Klik "📋 Lihat Medis" pada history      │
├─────────────────────────────────────────┤
│ GET /api/medical-records/appointment/:id│
├─────────────────────────────────────────┤
│ MemberMedicalRecordsModal (view)        │
├─────────────────────────────────────────┤
│ Tampil Foto, Diagnosis, Rekomendasi     │
└─────────────────────────────────────────┘
```

---

## 🎯 Important Notes

### ✅ Supported File Types
- ✓ JPEG
- ✓ PNG
- ✓ JPG
- ✓ WEBP

### ❌ NOT Supported
- ✗ PDF
- ✗ SVG
- ✗ GIF
- ✗ BMP

### 📏 File Limits
- **Max Size:** 10 MB per file
- **Recommended:** 2-5 MB untuk load cepat
- **Optimal Resolution:** 1920x1080 atau lebih kecil

### 🔒 Access Control
- ✓ Admin: Bisa upload & lihat semua records
- ✓ Member: Hanya bisa lihat record milik mereka
- ✓ Guest: Tidak bisa akses (harus login)

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Modal tidak terbuka | Check login token, refresh page |
| Image tidak upload | Max 10MB, PNG/JPG only, check folder permission |
| Notifikasi gagal | Check network tab, API endpoint, database |
| Data tidak terlihat di member | Admin harus set status = "completed" |
| Image broken link | Verify `/uploads/medical_records/` folder exists |

---

## 📱 Responsive Design

### Desktop View (≥768px)
- Table format dengan 5 kolom
- Foto Before/After side by side
- Full width modal

### Tablet View (640px - 768px)
- Compact table
- Stacked images
- Adjusted modal width

### Mobile View (<640px)
- Card format
- Full width
- Stack vertical
- Touch-friendly buttons

---

## 🔐 Security Checklist

- [ ] JWT token valid
- [ ] DB credentials secure
- [ ] Upload folder permissions (755)
- [ ] CORS configured
- [ ] File validation enabled
- [ ] Image dimensions checked
- [ ] Database indexed for performance

---

## 📞 Support

Jika ada masalah:
1. Check browser console (F12)
2. Check server logs: `npm run dev`
3. Verify database connection
4. Review MEDICAL_RECORDS_SETUP.md

---

**Enjoy using Medical Records Module! 🎉**
