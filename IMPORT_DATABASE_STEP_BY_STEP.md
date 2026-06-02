# Step-by-Step Guide: Import Database Produk Baru

## 📋 Persiapan

### Step 1: Pastikan File Database Siap
```
Lokasi file database baru:
✓ Harus format .sql (SQL dump)
✓ Contoh: beauty_clinic_baru.sql atau products.sql
✓ Letakkan di folder yang mudah diakses
```

**Lokasi file Anda:**
```
D:\Kuliah\Magang\mochintbeauty\products.sql ✅
```

---

## 🔄 Proses Import

### Step 2: Buka Terminal PowerShell
```powershell
# Di VS Code, buka Terminal baru
# Atau tekan Ctrl + ` (backtick)
```

### Step 3: Navigasi ke Folder Project
```powershell
cd d:\Kuliah\Magang\mochintbeauty\mochintbeauty-app
```

### Step 4: Backup Database Lama (Opsional tapi SANGAT Disarankan)
```powershell
# Command ini membuat backup sebelum import
cd```

💡 **Berguna jika terjadi kesalahan, bisa restore ke database lama**

### Step 5: Import Database Baru
```powershell
# Ganti "database_baru.sql" dengan nama file Anda
mysql -u root -p "" beauty_clinic < D:\Kuliah\Magang\mochintbeauty\database_baru.sql
```

**Output yang diharapkan:**
```
(tidak ada pesan error, langsung selesai)
```

---

## 🔗 Jalankan Migration

### Step 6: Navigasi ke Folder Server
```powershell
cd server
```

### Step 7: Jalankan Migration Script
```powershell
node run-migration.js
```

**Output yang diharapkan:**
```
🔄 Running migration...

📝 Creating table...
✅ Table created

📝 Creating table...
✅ Table created

📊 Migrating existing categories...
✅ Inserted X categories

🔗 Creating product-category relationships...
✅ Created X relationships

✅ Migration completed successfully!
```

---

## 🚀 Start Server

### Step 8: Jalankan Backend Server
```powershell
node server.js
```

**Output yang diharapkan:**
```
✅ Connected to MySQL database
🚀 Server running on port 5000
```

---

## ✅ Verifikasi

### Step 9: Buka Browser dan Test
```
URL: http://localhost:5000/api/products
```

**Harusnya terlihat:**
- Status: `200 OK`
- Response: Array of products dari database baru

---

## 📝 Checklist Akhir

- [ ] File database baru sudah siap (.sql)
- [ ] Backup database lama selesai
- [ ] Import database selesai (no error)
- [ ] Migration script selesai dengan sukses
- [ ] Server running di port 5000
- [ ] API `/api/products` respond 200 OK
- [ ] Refresh browser: Ctrl+Shift+R
- [ ] Admin panel Product page bisa buka tanpa error

---

## ❓ Jika Ada Error

| Error | Solusi |
|-------|--------|
| "Access denied for user" | Pastikan username/password MySQL benar |
| "Can't find file" | Pastikan path file database benar |
| "Table already exists" | Normal, script skip table yang sudah ada |
| "No database selected" | Pastikan database `beauty_clinic` sudah ada |

---

## 💾 File Yang Dibuat/Diupdate

Setelah proses selesai:
```
✅ backup_database_lama.sql (backup lama)
✅ categories table (baru)
✅ product_categories table (baru)
✅ data dari database baru (updated)
```

---

## 🎯 Selesai!

Ketika semua langkah selesai, aplikasi Anda:
- ✅ Pakai database produk baru
- ✅ Siap gunakan fitur multiple categories
- ✅ Admin panel 100% functional
- ✅ API all working

**Ready to go!** 🚀
