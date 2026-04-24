## 🔧 Panduan Setup Database MySQL

### Langkah 1: Pastikan MySQL Running
```bash
# Di Windows, cek apakah MySQL service sudah jalan
# Buka Services (services.msc) dan cari "MySQL80" atau "MySQL"
# Pastikan status-nya "Running"

# Atau jalankan:
mysql -u root
```

Jika error "command not found", tambahkan MySQL ke PATH atau gunakan full path:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql" -u root
```

---

### Langkah 2: Setup Database Pertama Kali

Jalankan script setup di folder server:

```bash
cd server

# Jika belum ada database, jalankan:
node setup_database.js

# Atau jika sudah ada, jalankan migration:
node run_migration.js

# Atau init tables:
node initTables.js
```

---

### Langkah 3: Verify Konfigurasi .env

Pastikan file `server/.env` sudah benar:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=       # kosong jika tidak ada password MySQL
DB_NAME=beauty_clinic
PORT=5000
```

**PENTING**: 
- Jika MySQL Anda punya password, isi di `DB_PASSWORD`
- Jika user bukan `root`, ubah di `DB_USER`
- Port default MySQL adalah 3306, sudah benar di config/database.js

---

### Langkah 4: Restart Server

```bash
cd server
npm run dev
```

Seharusnya akan muncul:
```
✅ Connected to MySQL database
```

---

### Troubleshooting

**Error: "PROTOCOL_CONNECTION_LOST"**
- MySQL belum running
- Host/port salah
- Database belum ada

**Error: "Access denied for user 'root'@'localhost'"**
- Password MySQL salah
- User tidak ada

**Error: "Unknown database 'beauty_clinic'"**
- Database belum dibuat
- Jalankan: `node setup_database.js`

---

### Import Database Dump (Jika Ada)

Jika ada file `.sql` di backup folder:

```bash
mysql -u root -p beauty_clinic < server/backup/klinik_kecantikan.sql
```

Atau gunakan MySQL Workbench / phpMyAdmin untuk import.
