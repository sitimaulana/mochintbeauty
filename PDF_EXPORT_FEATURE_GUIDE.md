# Fitur Download PDF Dashboard - Panduan Pengguna

## Deskripsi Fitur

Fitur baru ini memungkinkan admin untuk mendownload laporan dashboard dalam format PDF dengan kemampuan memilih rentang tanggal custom. Data yang didownload akan mencakup:

- **Statistik Ringkasan** (Total Member, Member Aktif, Janji Temu, Pendapatan, dll)
- **Data Terapis Teratas** (Daftar terapis dengan jumlah janji temu selesai)
- **Detail Janji Temu** (Maksimal 50 data terbaru dalam rentang tanggal)

## Cara Menggunakan

### 1. Buka Dashboard Admin
Navigasi ke halaman Dashboard admin (Beranda)

### 2. Klik Tombol "Download PDF"
Tombol hijau berlabel "Download PDF" terletak di sudut kanan atas halaman, di sebelah tombol "Segarkan Data"

### 3. Pilih Rentang Tanggal
Sebuah modal dialog akan muncul dengan dua field input:
- **Tanggal Mulai**: Tanggal awal rentang laporan
- **Tanggal Akhir**: Tanggal akhir rentang laporan

### 4. Validasi Tanggal
Sistem akan memvalidasi:
- Kedua field harus diisi
- Tanggal mulai tidak boleh lebih besar dari tanggal akhir
- Preview rentang akan ditampilkan saat kedua tanggal telah dipilih

### 5. Klik Tombol "Terapkan"
Sistem akan membuat PDF dan secara otomatis mendownloadnya dengan nama file:
```
Dashboard_YYYY-MM-DD_sampai_YYYY-MM-DD.pdf
```

Contoh: `Dashboard_2026-01-15_sampai_2026-03-20.pdf`

## Fitur Teknis

### Komponen yang Ditambahkan

1. **DateRangePicker Component** (`src/components/common/DateRangePicker.jsx`)
   - Modal dialog untuk memilih rentang tanggal
   - Validasi input dan pesan error
   - Preview rentang tanggal yang dipilih

2. **PDF Export Service** (`src/services/pdfExportService.js`)
   - Fungsi `generateDashboardPDF()` untuk membuat PDF
   - Filter data berdasarkan date range
   - Perhitungan statistik otomatis
   - Generate table data untuk laporan

3. **Dashboard Updates** (`src/pages/admin/Dashboard.jsx`)
   - Tombol "Download PDF" dengan status indicator
   - State management untuk modal date picker
   - Handler function `handleDownloadPDF()`

### Library yang Digunakan

- **jsPDF** (v2.5.1+): Generate PDF documents
- **html2canvas** (v1.4.1+): Convert HTML ke canvas (future use)
- **date-fns** (v3.0+): Date formatting dan utilities

## Struktur PDF yang Dihasilkan

### Halaman 1: Ringkasan
- Header dengan judul "Laporan Dashboard"
- Periode tanggal laporan
- Waktu pembuatan laporan
- Tabel statistik ringkasan

### Halaman Berikutnya (jika ada data):
- **Terapis Teratas**: Tabel 10 terapis dengan performa terbaik
- **Detail Janji Temu**: Tabel hingga 50 janji temu dalam periode

### Footer
- Nomor halaman otomatis pada setiap halaman

## Data yang Difilter

### Berdasarkan Tanggal
- **Janji Temu**: Difilter berdasarkan field `date` dalam rentang yang dipilih
- **Member**: Semua member ditampilkan (tidak difilter tanggal)
- **Terapis**: Data diambil dari janji temu dalam rentang tanggal

### Perhitungan Statistik
- Total Member: Seluruh member di database
- Member Aktif: Member dengan status = 'active'
- Total Janji Temu: Semua janji dalam rentang tanggal
- Janji Confirmed: Janji dengan status = 'confirmed'
- Janji Completed: Janji dengan status = 'completed'
- Total Pendapatan: Penjumlahan amount dari janji selesai
- Rata-rata Pendapatan: Total revenue / jumlah janji selesai

## Format Tanggal

Sistem menggunakan format tanggal:
- **Input**: Format HTML date input (YYYY-MM-DD)
- **Output PDF**: Format lokal Indonesia (dd MMM yyyy)
  Contoh: "15 Januari 2026"

## Troubleshooting

### Tombol "Download PDF" tidak berfungsi
1. Pastikan browser memiliki izin mendownload file
2. Cek console browser untuk error messages
3. Pastikan ada data di dashboard sebelum download

### PDF tidak dihasilkan / Error
1. Periksa console browser (F12 > Console tab)
2. Pastikan date range valid (start date ≤ end date)
3. Pastikan data sudah dimuat di dashboard

### File PDF kosong atau data tidak lengkap
1. Refresh halaman dashboard terlebih dahulu
2. Pastikan tanggal range mencakup data yang ada
3. Janji temu harus memiliki field `date` yang valid

## Batasan

- Maksimal 50 baris detail janji temu per laporan PDF
- Ukuran PDF tergantung banyaknya data dalam rentang tanggal
- Tanggal hanya dapat dipilih dalam format YYYY-MM-DD

## Tips Penggunaan

1. **Laporan Bulanan**: Pilih tanggal 1-akhir bulan untuk laporan bulanan
2. **Laporan Mingguan**: Pilih tanggal Senin-Minggu
3. **Custom Range**: Pilih tanggal sesuai kebutuhan bisnis
4. **Refresh Sebelum Download**: Pastikan klik "Segarkan Data" sebelum download untuk data terbaru

## File yang Dimodifikasi

```
├── src/
│   ├── components/common/
│   │   └── DateRangePicker.jsx (NEW)
│   ├── services/
│   │   └── pdfExportService.js (NEW)
│   └── pages/admin/
│       └── Dashboard.jsx (MODIFIED)
└── package.json (UPDATED - dependencies baru)
```

## Catatan Developer

### Untuk Kustomisasi Lebih Lanjut

Jika ingin menambahkan lebih banyak detail atau mengubah format PDF:

1. Edit `src/services/pdfExportService.js`
2. Modifikasi struktur table di `generateDashboardPDF()` function
3. Tambahkan atau ubah kolom dalam `statsData`, `appointmentTableData`, dll

Contoh menambah kolom baru:
```javascript
const statsData = [
  ['Metrik', 'Nilai'],
  ['Total Member', stats.totalMembers.toString()],
  // Tambah baris baru di sini
  ['Custom Metric', 'Custom Value'],
];
```

### Untuk Menambah Feature Baru

Struktur service memudahkan untuk menambah fitur seperti:
- Export ke Excel/CSV
- Email report otomatis
- Schedule report
- Multiple format export

Gunakan function yang sudah ada sebagai base dan extend sesuai kebutuhan.
