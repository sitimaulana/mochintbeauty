# 🔔 Appointment Reminder Feature Documentation

## Overview

Sistem reminder otomatis yang mengirim email ke customer sebelum jadwal treatment mereka. Fitur ini menggunakan **Nodemailer** untuk mengirim email dan berjalan secara berkala di background.

### Features
- ✅ Automatic reminder emails 2 jam sebelum appointment
- ✅ Professional email template dengan design menarik
- ✅ Background scheduler yang berjalan setiap 10 menit
- ✅ Tracking status reminder (sudah dikirim atau belum)
- ✅ Manual trigger untuk mengirim reminder
- ✅ API untuk admin management
- ✅ Configurable hours sebelum appointment
- ✅ Development mode (email logged to console jika tidak configured)

---

## Installation & Setup

### 1. Jalankan Migration SQL

```bash
# Copy file migration ke folder server
# File: server/add_reminder_column.sql

# Jalankan di MySQL/PhpMyAdmin:
mysql -u root -p beauty_clinic < server/add_reminder_column.sql
```

Atau manual di PhpMyAdmin:
```sql
-- Add reminder columns to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS reminder_hours_before INT DEFAULT 2;

-- Create index untuk faster queries
CREATE INDEX IF NOT EXISTS idx_reminder_status ON appointments(reminder_sent, status);
CREATE INDEX IF NOT EXISTS idx_appointment_datetime ON appointments(date, time);
```

### 2. Update Environment Variables

Edit `.env` file di folder `server/`:

```env
# Appointment Reminder Configuration
# Berapa jam sebelum appointment untuk mengirim reminder (default: 2 jam)
REMINDER_HOURS_BEFORE=2

# Berapa menit interval untuk check pending reminders (default: 10 menit)
REMINDER_CHECK_INTERVAL=10

# Enable/disable reminder service
REMINDER_SERVICE_ENABLED=true

# Email configuration (harus sudah ada)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Restart Server

```bash
cd server
npm run dev
```

Anda seharusnya melihat di console:

```
🔔 Reminder Service initialized
✅ Reminder Service started - Checking every 10 minutes
⏰ Sending reminders 2 hour(s) before appointment
```

---

## How It Works

### Workflow Reminder

```
1. Server start
   ↓
2. Reminder Service initialize & start
   ↓
3. Setiap 10 menit, checker:
   ├─ Query appointments scheduled untuk hari ini
   ├─ Filter yang belum reminder_sent = TRUE
   ├─ Filter waktu appointment antara: NOW dan NOW + 2 hours
   ├─ Untuk setiap appointment:
   │  ├─ Buat reminder email
   │  ├─ Kirim via Nodemailer
   │  ├─ Update reminder_sent = TRUE
   │  └─ Log di console
   └─ Repeat setiap 10 menit

4. Jika appointment dibatalkan atau di-reschedule:
   └─ Reminder otomatis direset untuk dikirim lagi
```

### Email Template

Email yang dikirim includes:
- 📌 Appointment number
- 💆 Treatment name & duration
- 📅 Appointment date (formatted)
- 🕐 Appointment time
- 💇 Therapist name (jika ada)
- 💰 Price
- 💡 Tips for customer
- 📞 Contact information

---

## API Endpoints

### 1. Get Reminder Statistics
```
GET /api/reminders/stats
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "total_appointments": 50,
    "reminders_sent": 35,
    "pending_reminders": 5,
    "today_reminders": 12
  }
}
```

### 2. Get Pending Reminders
```
GET /api/reminders/pending?hours=2
Authorization: Bearer <token>
```

Query Parameters:
- `hours` - Jam sebelum appointment (default: 2)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "appointment_id": "APT00001",
      "member_name": "John Doe",
      "member_email": "john@email.com",
      "treatment_name": "Facial Care",
      "date": "2026-04-28",
      "time": "14:00",
      "reminder_sent": false
    }
  ],
  "count": 3
}
```

### 3. Get Reminder History
```
GET /api/reminders/history
Authorization: Bearer <token>
```

Response: List of reminders yang sudah dikirim

### 4. Send Reminder Manually
```
POST /api/reminders/:appointmentId/send
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Reminder email sent to john@email.com",
  "appointment_id": 1
}
```

### 5. Send All Pending Reminders
```
POST /api/reminders/send-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "hours": 2
}
```

Response:
```json
{
  "success": true,
  "message": "Successfully sent 3 reminder(s) out of 5 pending",
  "sent": 3,
  "total": 5,
  "details": [
    {
      "appointment_id": 1,
      "email": "john@email.com",
      "status": "sent"
    }
  ]
}
```

### 6. Get Reminder Status
```
GET /api/reminders/:appointmentId/status
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reminder_sent": true,
    "reminder_sent_at": "2026-04-28 13:45:00"
  }
}
```

### 7. Reset Reminder (untuk re-send)
```
PUT /api/reminders/:appointmentId/reset
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Reminder status reset. Appointment ready for re-reminder"
}
```

### 8. Service Status
```
GET /api/reminders/service/status
Authorization: Bearer <token>
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

---

## Database Schema

### New Columns di table `appointments`

```sql
-- reminder_sent: Apakah reminder sudah dikirim (TRUE/FALSE)
-- reminder_sent_at: Timestamp kapan reminder dikirim
-- reminder_hours_before: Config berapa jam sebelum untuk mengirim reminder

ALTER TABLE appointments
ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN reminder_sent_at TIMESTAMP NULL,
ADD COLUMN reminder_hours_before INT DEFAULT 2;

CREATE INDEX idx_reminder_status ON appointments(reminder_sent, status);
CREATE INDEX idx_appointment_datetime ON appointments(date, time);
```

---

## Configuration

### Environment Variables (.env)

```env
# Reminder Settings
REMINDER_HOURS_BEFORE=2           # 1, 2, 3, 6, 12, 24
REMINDER_CHECK_INTERVAL=10        # Menit: 5, 10, 15, 30
REMINDER_SERVICE_ENABLED=true     # true/false

# Email Configuration (Required)
EMAIL_SERVICE=gmail
EMAIL_USER=your_clinic@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

### Tuning Configuration

**Untuk Development:**
```env
REMINDER_HOURS_BEFORE=1           # Lebih cepat test
REMINDER_CHECK_INTERVAL=1         # Check setiap 1 menit
```

**Untuk Production:**
```env
REMINDER_HOURS_BEFORE=2           # Standard 2 jam
REMINDER_CHECK_INTERVAL=10        # Cukup setiap 10 menit
REMINDER_SERVICE_ENABLED=true
```

---

## Services & Models

### 1. ReminderService (`server/services/reminderService.js`)

**Main Methods:**
```javascript
// Initialize dan start service
await reminderService.start()

// Check dan send reminders
await reminderService.checkAndSendReminders()

// Get upcoming appointments
reminderService.getUpcomingAppointments(hoursBefore)

// Send reminder untuk specific appointment
await reminderService.sendReminderEmail(appointment)

// Stop service
reminderService.stop()

// Get statistics
await reminderService.getStatistics()
```

### 2. EmailService (`server/services/emailService.js`)

**New Method:**
```javascript
// Send reminder email
await emailService.sendReminderEmail(reminderData)
```

**Example Usage:**
```javascript
const reminderData = {
  appointmentId: 1,
  appointmentNo: 'APT00001',
  customerName: 'John Doe',
  treatmentName: 'Facial Care',
  treatmentDuration: '60 menit',
  therapistName: 'Sarah',
  appointmentDate: '2026-04-28',
  appointmentTime: '14:00',
  amount: 400000,
  email: 'john@email.com'
};

await emailService.sendReminderEmail(reminderData);
```

### 3. Appointment Model (`server/models/Appointment.js`)

**New Methods:**
```javascript
// Mark reminder as sent
Appointment.markReminderSent(appointmentId)

// Get reminder status
Appointment.getReminderStatus(appointmentId)

// Get pending reminders
Appointment.getPendingReminders(hoursBefore)

// Get reminder statistics
Appointment.getReminderStats()

// Reset reminder (untuk re-send)
Appointment.resetReminder(appointmentId)

// Get appointments dengan reminder history
Appointment.getWithReminderHistory()
```

---

## Testing

### 1. Manual Test via API

```bash
# Get service status
curl -X GET http://localhost:5000/api/reminders/service/status \
  -H "Authorization: Bearer <your_token>"

# Get pending reminders
curl -X GET http://localhost:5000/api/reminders/pending \
  -H "Authorization: Bearer <your_token>"

# Send all pending reminders manually
curl -X POST http://localhost:5000/api/reminders/send-all \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"hours": 2}'

# Send reminder untuk specific appointment
curl -X POST http://localhost:5000/api/reminders/1/send \
  -H "Authorization: Bearer <your_token>"
```

### 2. Check Console Logs

Server console akan menampilkan:
```
✅ Reminder Service started - Checking every 10 minutes
📧 Found 3 appointment(s) for reminders
✅ Reminder email sent for appointment #APT00001 to john@email.com
```

### 3. Create Test Appointment

```sql
INSERT INTO appointments 
(appointment_id, member_id, customer_name, treatment_id, date, time, amount, status)
VALUES 
('APT99999', 1, 'Test User', 1, CURDATE(), ADDTIME(NOW(), '02:00:00'), 300000, 'confirmed');
```

---

## Common Issues & Solutions

### Issue 1: Reminders tidak terkirim

**Penyebab:**
- Email tidak dikonfigurasi di .env
- Appointment tidak di status "confirmed"
- Reminder sudah pernah dikirim sebelumnya

**Solusi:**
```bash
# 1. Check email configuration
echo $EMAIL_USER
echo $EMAIL_PASSWORD

# 2. Reset reminder untuk re-send
curl -X PUT http://localhost:5000/api/reminders/1/reset \
  -H "Authorization: Bearer <token>"

# 3. Trigger send manually
curl -X POST http://localhost:5000/api/reminders/1/send \
  -H "Authorization: Bearer <token>"
```

### Issue 2: Service tidak berjalan

**Check:**
```javascript
// Lihat di console apakah ada error saat startup
// Pastikan: REMINDER_SERVICE_ENABLED=true di .env
// Restart server: npm run dev
```

### Issue 3: Email template tidak tampil dengan benar

**Solusi:**
- Tunggu sedikit (email clients butuh waktu render)
- Cek di spam/junk folder
- Test dengan: `curl -X POST /api/reminders/1/send`

---

## Admin Interface Recommendations

### Dashboard Widget Ideas

```
┌─────────────────────────────────────┐
│ 🔔 Appointment Reminders            │
├─────────────────────────────────────┤
│ Status: ✅ Running                  │
│ Check Interval: Every 10 minutes    │
│ Hours Before: 2 hours               │
│                                     │
│ Today Reminders: 12/15 sent        │
│ Pending: 3                          │
│                                     │
│ [Manual Send] [View History] [Settings]
└─────────────────────────────────────┘
```

### Settings Panel

```
Reminder Configuration
├─ Hours Before: [2] ▼
├─ Check Interval: [10] minutes
├─ Enable Service: [✓]
├─ Auto Resend on Reschedule: [✓]
└─ [Save Settings]
```

### Pending Reminders View

```
Pending Reminders (3)
┌──────┬─────────┬──────────┬────────┬────────┐
│ No   │ Patient │ Treatment│ Date   │ Action │
├──────┼─────────┼──────────┼────────┼────────┤
│ 001  │ John    │ Facial   │ 14:00  │ [Send] │
│ 002  │ Jane    │ Massage  │ 15:30  │ [Send] │
│ 003  │ Bob     │ Spa      │ 16:00  │ [Send] │
└──────┴─────────┴──────────┴────────┴────────┘
```

---

## Performance Optimization

### Query Optimization

Indexes sudah dibuat untuk:
- `reminder_sent` + `status` → untuk filter pending reminders
- `date` + `time` → untuk appointment datetime queries

### Interval Tuning

```env
# Low frequency (hemat resource, kurang real-time)
REMINDER_CHECK_INTERVAL=30    # Check setiap 30 menit

# Medium frequency (balanced)
REMINDER_CHECK_INTERVAL=10    # Check setiap 10 menit (default)

# High frequency (responsive, lebih resource)
REMINDER_CHECK_INTERVAL=5     # Check setiap 5 menit
```

---

## Security Considerations

1. **Authentication**: Semua endpoint memerlukan Bearer token
2. **Database**: Gunakan environment variables untuk credentials
3. **Email**: Gmail App Password (bukan main password)
4. **HTTPS**: Gunakan HTTPS di production
5. **Rate Limiting**: Pertimbangkan add rate limiting untuk /send-all

---

## Troubleshooting Checklist

- [ ] Migration SQL sudah dijalankan?
- [ ] Email configured di .env?
- [ ] REMINDER_SERVICE_ENABLED=true?
- [ ] Server di-restart setelah ubah .env?
- [ ] Appointment status = "confirmed"?
- [ ] Appointment date/time di masa depan?
- [ ] No timezone issues?
- [ ] Database connection OK?

---

## Future Enhancements

1. SMS reminders (Twilio integration)
2. WhatsApp reminders (WhatsApp Business API)
3. Multiple reminder templates (urgent, casual, formal)
4. Customer preferences (opt-in/out reminders)
5. Reminder scheduling (send time customization)
6. Analytics dashboard
7. Bulk operations (resend to multiple)

---

## Support & Debugging

Enable debug logging:
```env
DEBUG=reminder:*
```

View detailed logs:
```bash
tail -f /var/log/beauty-app/reminder.log
```

---

**Created**: April 2026  
**Maintained by**: Development Team  
**Last Updated**: April 28, 2026
