## ⚡ Quick Start - Setup MySQL Database

### 📋 Pre-requisites
- ✅ MySQL Server sudah terinstall
- ✅ MySQL service sudah running

---

### 🚀 Step-by-Step Setup

#### **Step 1: Verify MySQL is Running**

**Windows:**
```bash
# Buka Services (Win + R → services.msc)
# Cari "MySQL80" atau "MySQL" → pastikan status "Running"
```

**Verify dengan terminal:**
```bash
mysql -u root
# Jika berhasil, akan muncul "mysql>"
# Ketik: exit
```

---

#### **Step 2: Setup Database Otomatis** ⭐ **REKOMENDASI**

```bash
cd server
npm run setup-db
```

Output yang diharapkan:
```
✅ Connected to MySQL
✅ Database 'beauty_clinic' ready
✅ All tables created (45 statements)
✅ Database setup complete!
```

---

#### **Step 3 (Alternative): Manual Setup**

Jika auto-setup tidak bekerja:

```bash
cd server

# Option A: Initialize tables dari kode
npm run init-db

# Option B: Import SQL dump
mysql -u root -p beauty_clinic < database/beauty_clinic.sql

# Option C: Run migration
npm run migrate
```

---

#### **Step 4: Start Server**

```bash
cd server
npm run dev
```

Sukses jika muncul:
```
✅ Connected to MySQL database
🚀 Server running on http://localhost:5000
```

---

### ❌ Troubleshooting

#### **Error: connect ECONNREFUSED 127.0.0.1:3306**
```
❌ Masalah: MySQL service tidak running
✅ Solusi:
  - Windows: Services → MySQL80 → Start
  - macOS: brew services start mysql
  - Linux: sudo systemctl start mysql
```

#### **Error: Access denied for user 'root'@'localhost'**
```
❌ Masalah: Password salah atau user tidak ada
✅ Solusi:
  - Edit server/.env
  - Set DB_PASSWORD dengan password MySQL Anda
  - Set DB_USER dengan user yang benar
```

#### **Error: Unknown database 'beauty_clinic'**
```
❌ Masalah: Database belum dibuat
✅ Solusi:
  - Jalankan: npm run setup-db
  - Atau: mysql -u root -p -e "CREATE DATABASE beauty_clinic;"
```

#### **Error: ER_NO_REFERENCED_TABLE**
```
❌ Masalah: Foreign key references error
✅ Solusi:
  - Jalankan setup-db ulang
  - Atau import ulang: mysql -u root beauty_clinic < database/beauty_clinic.sql
```

---

### ✅ Verify Setup Berhasil

Cek tables sudah dibuat:
```bash
mysql -u root beauty_clinic -e "SHOW TABLES;"
```

Output akan menampilkan semua tables seperti:
```
+-------------------------+
| Tables_in_beauty_clinic |
+-------------------------+
| admin_users             |
| appointments            |
| members                 |
| therapists              |
| treatments              |
| ...                     |
+-------------------------+
```

---

### 🎯 Frontend & Backend Running

**Terminal 1 - Backend:**
```bash
cd mochintbeauty-app/server
npm run dev
# Output: Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd mochintbeauty-app
npm run dev
# Output: Local: http://localhost:5173
```

---

### 📝 Notes

- Default MySQL user: `root` (tanpa password)
- Default port: `3306`
- Database name: `beauty_clinic`
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

Konfigurasi bisa diubah di `server/.env`

---

### 🆘 Still Having Issues?

1. Pastikan MySQL running: `mysql -u root`
2. Cek .env config sudah benar
3. Cek file `.env.local` di root folder (untuk frontend proxy)
4. Jalankan: `npm run setup-db` lagi
5. Restart terminal dan server

Jika masih ada error, share screenshot error-nya! 🚀
