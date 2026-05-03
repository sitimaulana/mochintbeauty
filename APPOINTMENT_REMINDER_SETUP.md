# 📧 Implementasi Fitur Appointment Reminder Email

## 📋 Summary

Anda sekarang memiliki sistem reminder otomatis yang lengkap untuk mengirim email ke customer sebelum jadwal treatment mereka. Sistem ini menggunakan **Nodemailer** dan berjalan secara background.

---

## 🚀 Quick Start (5 Menit)

### Step 1: Setup Database (2 menit)

```bash
cd server
node setup_reminder_feature.js
```

Atau manual jalankan SQL di `server/add_reminder_column.sql`

### Step 2: Update .env (1 menit)

```env
# Add ke server/.env
REMINDER_HOURS_BEFORE=2
REMINDER_CHECK_INTERVAL=10
REMINDER_SERVICE_ENABLED=true
```

### Step 3: Restart Server (1 menit)

```bash
npm run dev
```

### Step 4: Verify (1 menit)

Lihat di console:
```
🔔 Reminder Service initialized
✅ Reminder Service started - Checking every 10 minutes
⏰ Sending reminders 2 hour(s) before appointment
```

✅ **Selesai! Sistem reminder sudah berjalan.**

---

## 📁 Files Yang Ditambahkan

### Backend Files

```
server/
├── services/
│   ├── reminderService.js          ← Reminder logic & scheduler
│   └── emailService.js             ← Updated: tambah sendReminderEmail()
├── models/
│   └── Appointment.js              ← Updated: tambah reminder methods
├── routes/
│   └── appointmentReminderRoutes.js ← Reminder API endpoints
├── add_reminder_column.sql         ← Database migration
├── setup_reminder_feature.js       ← Setup script
├── REMINDER_FEATURE.md             ← Dokumentasi lengkap
└── .env                            ← Updated: reminder config
```

### Frontend Files

```
src/
└── pages/admin/
    └── ReminderManagement.jsx      ← Admin dashboard component
```

### Updated Files

```
server/
├── server.js                       ← Added reminder service initialization
└── .env                            ← Added reminder configuration
```

---

## 🔧 How It Works

### Workflow

```
Server Start
    ↓
Initialize Reminder Service
    ↓
Start Background Scheduler (every 10 minutes)
    ├── Query: appointments hari ini dengan status = confirmed
    ├── Filter: reminder_sent = FALSE
    ├── Filter: appointment time = NOW until NOW + 2 hours
    ├── For each appointment:
    │   ├── Prepare email data
    │   ├── Send via Nodemailer (Gmail)
    │   ├── Update reminder_sent = TRUE
    │   └── Log success/error
    └── Wait 10 minutes, repeat
```

### Database Changes

```sql
-- Kolom baru di table appointments
reminder_sent          → BOOLEAN (TRUE/FALSE)
reminder_sent_at       → TIMESTAMP (kapan reminder dikirim)
reminder_hours_before  → INT (config jam sebelum reminder)

-- Indexes untuk performance
idx_reminder_status    → (reminder_sent, status)
idx_appointment_datetime → (date, time)
```

---

## 📧 Email Template

Customer akan menerima email dengan:

```
FROM: mochintclinic@gmail.com
SUBJECT: Pengingat Jadwal Perawatan - [Treatment Name]

EMAIL CONTENT:
┌────────────────────────────────────┐
│ MOCHINT BEAUTY CLINIC              │
├────────────────────────────────────┤
│                                    │
│ Halo, [Customer Name]!             │
│                                    │
│ ⏰ Pengingat Jadwal Perawatan      │
│ Anda memiliki jadwal yang akan     │
│ datang dalam beberapa jam.         │
│                                    │
│ Appointment Details:               │
│ • No: APT00001                     │
│ • Treatment: Facial Care           │
│ • Duration: 60 menit              │
│ • Date: Monday, April 28, 2026    │
│ • Time: 14:00 (Highlighted)       │
│ • Therapist: Sarah                 │
│ • Price: Rp 400.000               │
│                                    │
│ 💡 Tips untuk Anda:               │
│ • Tiba 10-15 menit lebih awal     │
│ • Pastikan kulit bersih            │
│ • Hindari makeup tebal             │
│ • Hubungi kami untuk ubah jadwal  │
│                                    │
│ [View Schedule Button]             │
│                                    │
└────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api/reminders
```

### Endpoints

```
GET  /stats              → Lihat statistik reminder
GET  /pending            → Lihat pending reminders
GET  /history            → Lihat reminder history
GET  /:appointmentId/status → Lihat reminder status
POST /:appointmentId/send    → Send reminder manual
POST /send-all           → Send semua pending
PUT  /:appointmentId/reset   → Reset reminder
GET  /service/status     → Lihat status service
```

### Example Usage

```bash
# Get stats
curl -X GET http://localhost:5000/api/reminders/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get pending reminders
curl -X GET http://localhost:5000/api/reminders/pending \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send manually
curl -X POST http://localhost:5000/api/reminders/1/send \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send all pending
curl -X POST http://localhost:5000/api/reminders/send-all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hours": 2}'
```

---

## ⚙️ Configuration

### Environment Variables

```env
# server/.env

# Reminder Settings
REMINDER_HOURS_BEFORE=2
# Berapa jam sebelum appointment untuk kirim reminder
# Options: 1, 2, 3, 6, 12, 24

REMINDER_CHECK_INTERVAL=10
# Menit check untuk pending reminders
# Options: 1, 5, 10, 15, 30

REMINDER_SERVICE_ENABLED=true
# Enable/disable reminder service
# Options: true, false

# Email Settings (sudah ada)
EMAIL_SERVICE=gmail
EMAIL_USER=your_clinic@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

### Production Settings

```env
REMINDER_HOURS_BEFORE=2
REMINDER_CHECK_INTERVAL=10
REMINDER_SERVICE_ENABLED=true
```

### Development Settings

```env
REMINDER_HOURS_BEFORE=1
REMINDER_CHECK_INTERVAL=1
REMINDER_SERVICE_ENABLED=true
```

---

## 🧪 Testing

### Test 1: Manual Trigger

```javascript
// Di browser console atau postman
const appointmentId = 1;

await fetch('http://localhost:5000/api/reminders/1/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(r => r.json())
.then(data => console.log(data));
```

### Test 2: Create Test Appointment

```sql
INSERT INTO appointments 
(appointment_id, member_id, customer_name, treatment_id, date, time, amount, status)
VALUES 
('APT99999', 1, 'Test User', 1, CURDATE(), DATE_ADD(NOW(), INTERVAL 1 HOUR), 300000, 'confirmed');
```

### Test 3: Check Console Logs

```
📧 Found 1 appointment(s) for reminders
✅ Reminder email sent for appointment #APT99999 to test@email.com
```

---

## 🎨 Admin Dashboard (Optional)

Komponen React sudah disediakan di:
```
src/pages/admin/ReminderManagement.jsx
```

Untuk mengintegrasikan:

1. Import di admin routes:
```javascript
import ReminderManagement from '../pages/admin/ReminderManagement';
```

2. Add route:
```javascript
<Route path="reminders" element={<ReminderManagement />} />
```

3. Add menu item di sidebar

Dashboard features:
- 📊 View reminder statistics
- 📋 View pending reminders
- 📧 Send reminders manually
- 📜 View sent history
- 🔄 Real-time refresh

---

## 🔍 Database Schema

### Appointments Table Changes

```sql
-- Kolom baru
ALTER TABLE appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN reminder_sent_at TIMESTAMP NULL;
ALTER TABLE appointments ADD COLUMN reminder_hours_before INT DEFAULT 2;

-- Indexes
CREATE INDEX idx_reminder_status ON appointments(reminder_sent, status);
CREATE INDEX idx_appointment_datetime ON appointments(date, time);
```

### Query Examples

```sql
-- Get pending reminders
SELECT * FROM appointments 
WHERE reminder_sent = FALSE 
AND status = 'confirmed'
AND DATE(date) = CURDATE()
AND TIME(CONCAT(date, ' ', time)) BETWEEN NOW() AND ADDTIME(NOW(), INTERVAL 2 HOUR);

-- Get reminder statistics
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN reminder_sent = TRUE THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN reminder_sent = FALSE AND status = 'confirmed' THEN 1 ELSE 0 END) as pending
FROM appointments
WHERE date >= CURDATE();

-- Mark reminder as sent
UPDATE appointments 
SET reminder_sent = TRUE, reminder_sent_at = NOW()
WHERE id = ?;
```

---

## 🚨 Troubleshooting

### Issue: Reminders tidak terkirim

**Check list:**
- [ ] Database migration sudah dijalankan?
- [ ] Email configured di .env?
- [ ] REMINDER_SERVICE_ENABLED=true?
- [ ] Server di-restart?
- [ ] Appointment status = "confirmed"?
- [ ] Appointment date/time di masa depan?

**Solution:**
```bash
# 1. Run setup ulang
node setup_reminder_feature.js

# 2. Check env
cat .env | grep REMINDER

# 3. Check database
SELECT * FROM appointments WHERE reminder_sent = TRUE LIMIT 5;

# 4. Restart server
npm run dev
```

### Issue: Email tidak terima

**Mungkin:**
- Email masuk ke spam/junk
- Email client belum render template
- Service tidak running

**Solution:**
```bash
# Check service status
curl -X GET http://localhost:5000/api/reminders/service/status \
  -H "Authorization: Bearer TOKEN"

# Send test email
curl -X POST http://localhost:5000/api/reminders/1/send \
  -H "Authorization: Bearer TOKEN"

# Check console logs
# Harus ada: ✅ Reminder email sent successfully!
```

### Issue: Console error "Cannot read property 'start' of undefined"

**Penyebab:** reminderService tidak properly imported

**Solution:**
```bash
# Check server.js imports
head -n 30 server.js | grep reminderService

# Verify file exists
ls -la services/reminderService.js

# Restart
npm run dev
```

---

## 📊 Monitoring

### Check Service Status

```bash
curl -X GET http://localhost:5000/api/reminders/service/status \
  -H "Authorization: Bearer TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "service_running": true,
    "check_interval_minutes": 10,
    "reminder_hours_before": 2,
    "statistics": {
      "total_appointments": 50,
      "reminders_sent": 35,
      "pending_reminders": 5,
      "today_reminders": 12
    }
  }
}
```

### Check Logs

```bash
# Real-time logs
tail -f server.log

# Grep reminder logs
grep "Reminder" server.log

# Last 50 lines
tail -n 50 server.log
```

---

## 🔐 Security Notes

1. **Authentication**: Semua endpoint memerlukan Bearer token
2. **Email**: Use App Password for Gmail (bukan main password)
3. **Database**: Credentials di .env, jangan commit
4. **HTTPS**: Use HTTPS di production
5. **Rate Limiting**: Consider adding untuk /send-all endpoint

---

## 📚 Additional Resources

- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SMTP Configuration](https://www.nodemailer.com/smtp/authentication/)
- [Full Documentation](./REMINDER_FEATURE.md)

---

## 📝 Next Steps

### Immediate

- [ ] Run database migration
- [ ] Update .env
- [ ] Restart server
- [ ] Test with sample appointment
- [ ] Check console logs

### Short Term (1-2 weeks)

- [ ] Integrate admin dashboard component
- [ ] Add reminder settings UI
- [ ] Setup monitoring/alerts
- [ ] Test with real customer data

### Long Term (1-3 months)

- [ ] SMS reminders (Twilio integration)
- [ ] WhatsApp reminders
- [ ] Customer opt-in/out preferences
- [ ] Advanced scheduling options
- [ ] Analytics dashboard

---

## 👨‍💼 Support

For issues or questions:
1. Check REMINDER_FEATURE.md (detailed docs)
2. Check console logs for errors
3. Test API endpoints manually
4. Verify database columns exist
5. Check .env configuration

---

## 📄 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `reminderService.js` | Scheduler & reminder logic | ✅ Created |
| `emailService.js` | Email sending (updated) | ✅ Updated |
| `Appointment.js` | Database methods (updated) | ✅ Updated |
| `appointmentReminderRoutes.js` | API endpoints | ✅ Created |
| `add_reminder_column.sql` | Database migration | ✅ Created |
| `setup_reminder_feature.js` | Setup script | ✅ Created |
| `ReminderManagement.jsx` | Admin component | ✅ Created |
| `REMINDER_FEATURE.md` | Full documentation | ✅ Created |
| `server.js` | Integration (updated) | ✅ Updated |
| `.env` | Configuration (updated) | ✅ Updated |

---

## 🎉 You're All Set!

Sistem reminder appointment sekarang sudah fully functional. Customers akan menerima email reminder 2 jam sebelum jadwal treatment mereka.

**Last Updated**: April 28, 2026  
**Version**: 1.0  
**Status**: Production Ready

---

**Questions?** Check REMINDER_FEATURE.md for detailed documentation.
