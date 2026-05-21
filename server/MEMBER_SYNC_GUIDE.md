# MEMBER DATA SYNC - Dokumentasi Lengkap

## 📋 Ringkasan

Sistem ini memastikan bahwa data member (`total_visits` dan `last_visit`) selalu sesuai dengan data yang ada di appointment table. Ini dilakukan secara otomatis dan manual.

## 🔄 Bagaimana Sistem Bekerja

### 1. **Auto-Sync (Otomatis)**
Setiap kali status appointment berubah menjadi `completed`, sistem secara otomatis:
- Menghitung total kunjungan yang selesai untuk member
- Mengupdate field `last_visit` dengan tanggal kunjungan terbaru
- Menyimpan data ke Member table

**Lokasi Kode:** 
- `server/controllers/appointmentController.js` - fungsi `updateAppointment()` dan `updateAppointmentStatus()`

**Trigger:**
- Saat status appointment diubah menjadi 'completed'

### 2. **Manual Sync (Manual)**

#### Option A: Via API Endpoint
```bash
# Sinkronkan single member
POST /api/members/:id/sync

# Sinkronkan semua members
POST /api/members/sync-all/members
```

#### Option B: Via Node Script
```bash
cd server
node sync_member_data.js
```

Script ini akan:
- Membaca semua members dari database
- Untuk setiap member, hitung total completed appointments
- Update database dengan nilai terbaru
- Tampilkan laporan detail

## 📊 Field yang Disinkronkan

| Field | Sumber | Deskripsi |
|-------|--------|-----------|
| `total_visits` | Jumlah appointments dengan status 'completed' | Total kunjungan yang selesai |
| `last_visit` | Appointment date paling baru dengan status 'completed' | Tanggal kunjungan terakhir |

## 🚀 Kapan Menggunakan Sync

### Auto-Sync (Sudah Berjalan Otomatis)
- Terjadi setiap kali appointment status diubah ke 'completed'
- Tidak perlu action manual
- Logging: Check server console untuk debug

### Manual Sync diperlukan saat:
1. **Setup pertama kali** - existing appointments belum tersinkronkan
2. **Data inconsistency** - jika ada ketidaksesuaian antara Member dan Appointments
3. **Batch update** - setelah melakukan banyak perubahan appointment

## 📝 Contoh Penggunaan

### Scenario 1: Setup Pertama Kali
```bash
# Server sudah punya banyak appointments, tapi Member data belum updated
cd server
node sync_member_data.js

# Output:
# [1/50] ✅ Budi Santoso: 5 kunjungan (terakhir: 2024-01-15)
# [2/50] ✅ Siti Nurhaliza: 3 kunjungan (terakhir: 2024-01-10)
# ...
```

### Scenario 2: Sinkronkan Setelah Update Appointment
```bash
# Admin update appointment status ke 'completed'
# Auto-sync berjalan di background
# Member.total_visits & Member.last_visit otomatis terupdate

# Check di database:
SELECT id, name, total_visits, last_visit FROM members WHERE id = 1;
```

### Scenario 3: Gunakan API di Frontend
```javascript
// Sinkronkan single member
axios.post('/api/members/5/sync', {}, {
  headers: { Authorization: `Bearer ${token}` }
})

// Response:
{
  "success": true,
  "message": "Member synced successfully",
  "data": {
    "total_visits": 8,
    "last_visit": "2024-01-15",
    "appointment_count": 8
  }
}
```

## 🔧 Troubleshooting

### Problem: Data Member tidak sesuai dengan Appointment
**Solution:**
```bash
# Run manual sync
cd server
node sync_member_data.js
```

### Problem: Auto-sync tidak jalan
**Check:**
1. Lihat server console untuk error messages
2. Pastikan Member model sudah ter-import di appointmentController
3. Cek database connection

### Problem: Script hang/tidak selesai
**Solution:**
```bash
# Stop dengan Ctrl+C dan run lagi
# Atau cek database connection
node sync_member_data.js
```

## 📈 Monitoring

### Check sync status via database query:
```sql
-- Lihat members dengan data lengkap
SELECT 
  m.id,
  m.name,
  m.total_visits,
  m.last_visit,
  COUNT(a.id) as appointment_count_check,
  MAX(a.date) as latest_appointment_date
FROM members m
LEFT JOIN appointments a ON m.id = a.member_id AND a.status = 'completed'
GROUP BY m.id, m.name, m.total_visits, m.last_visit
ORDER BY m.total_visits DESC;
```

## 🎯 Best Practices

1. **Run Manual Sync Periodically**
   - Jalankan setiap minggu atau setelah bulk operations
   - Pastikan data selalu konsisten

2. **Monitor Auto-Sync**
   - Check server logs untuk memastikan auto-sync berjalan
   - Lihat console message: `✅ Member {id} synced: {visits} visits`

3. **Backup Data**
   - Sebelum run sync script besar, backup database
   - Terutama jika ada custom data

## 📞 Support

Jika ada issues:
1. Check server logs: `npm run dev` dan lihat console
2. Run: `node sync_member_data.js` untuk diagnose
3. Check database manually dengan SQL query di atas

---

**Last Updated:** 2024-01-15
**Version:** 1.0
