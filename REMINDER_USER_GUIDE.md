# 📧 Fitur Reminder - Panduan Penggunaan

## Overview
Fitur reminder memungkinkan Anda untuk mengatur dan mengirim notifikasi email reminder kepada pelanggan sebelum jadwal treatment mereka.

## Fitur-Fitur Baru di Halaman Appointment

### 1. **Kolom Reminder Status di Tabel**
- Menampilkan status pengiriman reminder untuk setiap appointment
- **"Belum kirim"** (orange) - Reminder belum dikirim
- **"✓ Terkirim"** (green) - Reminder sudah dikirim

### 2. **Tombol Manajemen Reminder**
Klik tombol status reminder untuk membuka modal manajemen reminder

### 3. **Modal Reminder Management**
Modal ini menampilkan:

#### **Informasi Appointment**
- Nama pelanggan
- Jadwal (tanggal & waktu)
- ID Member

#### **Status Reminder**
- Menampilkan apakah reminder sudah dikirim
- Timestamp pengiriman jika sudah dikirim

#### **Pengaturan Jam Reminder** 
Pilih berapa jam sebelum appointment reminder harus dikirim:
- 1 Jam sebelumnya
- 2 Jam sebelumnya (default)
- 3 Jam sebelumnya
- 4 Jam sebelumnya
- 1 Hari sebelumnya

#### **Tombol Aksi**
- **📧 Kirim Sekarang** - Kirim reminder secara manual sekarang
- **Reset Reminder** - Hapus status reminder (hanya tampil jika reminder sudah dikirim)
- **Tutup** - Tutup modal

### 4. **Setting Reminder di Form Tambah/Edit Appointment**
Saat membuat atau mengedit appointment, Anda bisa mengatur jam reminder di section:
- **⏰ Setting Reminder (Jam sebelum appointment)**
- Pilih dari opsi yang sama seperti di modal manajemen

## Cara Menggunakan

### Mengirim Reminder Manual
1. Klik status reminder di kolom **📧 Reminder** di tabel appointment
2. Modal manajemen reminder akan terbuka
3. Klik tombol **📧 Kirim Sekarang**
4. Sistem akan mengirim email reminder ke pelanggan
5. Status akan berubah menjadi "✓ Terkirim" dengan timestamp

### Mengatur Jam Reminder
#### Saat Membuat Appointment Baru:
1. Klik tombol "Tambah Janji Temu"
2. Di section **⏰ Setting Reminder**, pilih jam yang diinginkan
3. Default adalah 2 jam sebelumnya
4. Klik "Buat Janji Temu"

#### Saat Edit Appointment:
1. Klik tombol "Edit" pada appointment yang ingin diubah
2. Scroll ke section **⏰ Setting Reminder**
3. Ubah jam reminder jika diperlukan
4. Klik "Perbarui Janji Temu"

### Reset Reminder
1. Klik status reminder di appointment yang reminder-nya sudah terkirim
2. Modal manajemen reminder akan terbuka
3. Klik tombol **Reset Reminder**
4. Status akan kembali ke "Belum kirim"
5. Anda bisa mengirim reminder lagi jika diperlukan

## Cara Kerja Sistem Reminder

### Reminder Otomatis
- Sistem secara otomatis memeriksa appointment setiap 10 menit
- Jika appointment dalam waktu 2 jam (atau sesuai setting), otomatis kirim reminder
- Email akan dikirim ke email pelanggan

### Reminder Manual
- Anda bisa kirim reminder kapan saja melalui modal manajemen
- Reminder bisa dikirim ulang dengan mereset terlebih dahulu

## Email Template
Email reminder berisi:
- Judul appointment
- Tanggal dan waktu
- Nama treatment
- Nama therapist
- Harga treatment
- Tips persiapan
- Informasi kontak klinik

## Troubleshooting

### Reminder Tidak Terkirim
1. Periksa apakah email pelanggan valid di database members
2. Periksa konfigurasi email di `.env`
3. Lihat server logs untuk error message

### Reminder Terkirim Tapi Tidak Sampai
1. Periksa folder spam pelanggan
2. Pastikan email configured benar di `.env`
3. Cek Gmail settings jika menggunakan Gmail

### Mengubah Setting Reminder Jam
1. Semua setting di form akan tersimpan otomatis
2. Bisa dirubah kapan saja saat edit appointment

## Tips Menggunakan Fitur Reminder

✅ **Best Practices:**
- Set reminder 2 jam sebelumnya untuk treatment regular
- Set reminder 1 hari sebelumnya untuk treatment premium
- Selalu periksa email pelanggan saat membuat appointment
- Gunakan reminder manual untuk appointment mendadak

❌ **Yang Sebaiknya Dihindari:**
- Jangan kirim reminder terlalu banyak (bisa dianggap spam)
- Jangan set reminder kurang dari 1 jam
- Jangan lupa update email pelanggan di master data

## API Endpoints (Backend)

Jika Anda perlu integrasi lebih lanjut, berikut API endpoints yang tersedia:

### Mengirim Reminder
```
POST /api/reminders/{appointmentId}/send
Headers: Authorization: Bearer {JWT_TOKEN}
```

### Cek Status Reminder
```
GET /api/reminders/{appointmentId}/status
Headers: Authorization: Bearer {JWT_TOKEN}
```

### Reset Reminder
```
PUT /api/reminders/{appointmentId}/reset
Headers: Authorization: Bearer {JWT_TOKEN}
```

### Lihat Semua Reminder Pending
```
GET /api/reminders/pending
Headers: Authorization: Bearer {JWT_TOKEN}
```

### Lihat Statistik Reminder
```
GET /api/reminders/stats
Headers: Authorization: Bearer {JWT_TOKEN}
```

---

**Dokumentasi diperbarui:** April 28, 2026
**Status:** ✅ Production Ready
