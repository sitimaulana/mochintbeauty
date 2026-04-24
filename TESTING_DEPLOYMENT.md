# 🧪 Google OAuth Testing & Deployment Guide

Panduan untuk testing Google OAuth dan deployment ke production.

---

## Testing Scenarios

### Scenario 1: New User - First Time Login

**Test Case:** User yang belum pernah register login dengan Google

1. **Action**: Klik "MASUK DENGAN GOOGLE" di login page
2. **Login**: Pilih test Google account yang belum terdaftar
3. **Expected Result**:
   - User diredirect ke email verification page
   - OTP dikirim ke email (atau muncul di backend terminal)
   - User enter OTP → verify → masuk page set password
   - User set password (min 8 char)
   - User diredirect ke dashboard
   - ✅ User berhasil login, account dibuat di database

**Verify Database:**
```sql
SELECT * FROM members WHERE google_id IS NOT NULL;
```

---

### Scenario 2: Existing Google User - Already Has Password

**Test Case:** User yang sudah pernah login dengan Google dan sudah set password

1. **Action**: Klik "MASUK DENGAN GOOGLE"
2. **Login**: Gunakan Google account yang sudah terdaftar dan punya password
3. **Expected Result**:
   - User langsung diredirect ke dashboard
   - ✅ Tidak perlu verify email atau set password lagi

---

### Scenario 3: User Login Multiple Ways

**Test Case:** User bisa login dengan:
- Email + Password
- Google + Password (yang sudah di-set)

1. **Action 1**: Login dengan email biasa
   - ✅ Should work
2. **Action 2**: Logout kemudian login dengan Google
   - ✅ Should work
3. **Action 3**: Logout kemudian login dengan email lagi
   - ✅ Should work

---

### Scenario 4: Error Handling

#### Invalid Callback
**Setup**: Buat typo di `GOOGLE_CALLBACK_URL` di .env

**Expected**: Error message "Callback tidak valid"

#### Missing Credentials
**Setup**: Kosongkan `GOOGLE_CLIENT_ID` di .env

**Expected**: Error message "Google OAuth not configured" atau similar

#### Network Error
**Setup**: Stop backend server sambil user login

**Expected**: Error message tentang server error

---

## Database Verification

### Check Google OAuth Users

```sql
-- Lihat semua user yang login via Google
SELECT id, name, email, google_id, password, profile_picture, created_at 
FROM members 
WHERE google_id IS NOT NULL;
```

Expected output:
```
id | name        | email           | google_id     | password | profile_picture | created_at
---|-------------|-----------------|---------------|----------|-----------------|----------
1  | John Doe    | john@gmail.com  | 123456789...  | hashed   | url             | 2024-04-25
```

### Check Password was Set

```sql
-- Verify user has password (untuk set password flow)
SELECT id, email, password 
FROM members 
WHERE email = 'test@gmail.com';
```

Expected: Password should be hashed (tidak NULL, starts with `$2a$` atau `$2b$`)

---

## OTP Verification Testing

### In Development Mode

**Without Email Service:**
1. User submit email → OTP generated
2. Backend terminal will show:
   ```
   ✅ OTP stored for: email@gmail.com
   🔐 Generated OTP: 123456
   ```
3. Copy OTP dari terminal → paste di form
4. Verify → password set → done

### In Production Mode

**With Email Service:**
1. User submit email → OTP generated
2. OTP dikirim ke email user
3. User check email → get OTP
4. User input OTP → verify

**Simulate Gmail:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=mochintclinic@gmail.com
EMAIL_PASSWORD=dpxbadvautyxfrib
```

Send test email:
```bash
node -e "require('./services/emailService').sendOTP('test@example.com', 'Test', '123456')"
```

---

## Frontend Testing

### URL Testing

**Test URLs:**
1. `http://localhost:5173/auth/login` - Login page with Google button
2. `http://localhost:5173/auth/verify-email` - Email verification page
3. `http://localhost:5173/auth/google/callback` - Callback handler

### Google Button Testing

**Check:**
```javascript
// Browser console (F12)

// 1. Verify button exists
document.querySelector('button').textContent // Should include "GOOGLE"

// 2. Check redirect function
console.log(window.location.href) // Should start with http://localhost:5000/api/auth/google
```

### Session Storage Testing

**After successful login:**
```javascript
// Browser console
localStorage.getItem('token')         // Should be JWT token
localStorage.getItem('user')          // Should be user object
localStorage.getItem('user_type')     // Should be 'member'
localStorage.getItem('active_user')   // Should be user object
```

---

## Backend API Testing

### Test dengan cURL atau Postman

**1. Test Google OAuth Endpoint:**
```bash
curl http://localhost:5000/api/auth/google
# Should redirect to Google OAuth consent screen
```

**2. Send OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","name":"Test User"}'
```

Response:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**3. Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","otp":"123456"}'
```

**4. Set Password:**
```bash
curl -X POST http://localhost:5000/api/auth/set-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"NewPassword123"}'
```

---

## Performance Testing

### Login Response Time

**Expected:**
- Google redirect: < 1 second
- OTP send: < 3 seconds
- OTP verify: < 1 second
- Password set: < 1 second
- Dashboard load: < 2 seconds

**Monitor:**
```bash
# Terminal
time curl http://localhost:5000/api/auth/send-otp -d "{...}"
```

---

## Security Testing

### 1. JWT Token Validation

```bash
# Test with invalid token
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:5000/api/member/profile

# Expected: 403 Forbidden
```

### 2. OTP Expiry

```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -d '{"email":"test@gmail.com"}'

# Wait 6 minutes (OTP expires after 5 min)

# Try verify with old OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -d '{"email":"test@gmail.com","otp":"123456"}'

# Expected: "OTP expired"
```

### 3. Password Strength

```bash
# Test password < 8 chars
curl -X POST http://localhost:5000/api/auth/set-password \
  -d '{"email":"test@gmail.com","password":"short"}'

# Expected: Error "Password must be at least 8 characters"
```

### 4. Email Verification Required

```bash
# Try set password without verifying OTP first
curl -X POST http://localhost:5000/api/auth/set-password \
  -d '{"email":"test@gmail.com","password":"ValidPassword123"}'

# Expected: Error "Email not verified"
```

---

## Deployment Checklist

### Pre-Production

- [ ] All test scenarios passed
- [ ] Database verified (google_id stored correctly)
- [ ] OTP expiry tested (5 minutes)
- [ ] Email service tested (if available)
- [ ] Error handling tested
- [ ] Session timeout tested (24 hours)
- [ ] HTTPS/SSL ready
- [ ] Domain configured

### Production Environment

**Update `.env`:**
```env
NODE_ENV=production
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=production_secret_key_here
SESSION_SECRET=production_session_secret
```

**Update Google Console:**
1. Create new Web application credential (production)
2. Add authorized origin: `https://yourdomain.com`
3. Add redirect URI: `https://yourdomain.com/api/auth/google/callback`

### Post-Deployment

- [ ] Test login dari production domain
- [ ] Verify HTTPS working
- [ ] Check database untuk new users
- [ ] Monitor error logs
- [ ] Test OTP sending
- [ ] Test user profile persistence

---

## Monitoring

### Key Metrics

```bash
# Monitor backend
tail -f /var/log/server.log

# Watch OTP storage
npm run dev -- --inspect

# Monitor database
SELECT COUNT(*) as total_users FROM members;
SELECT COUNT(*) as google_users FROM members WHERE google_id IS NOT NULL;
```

### Error Logging

Backend logs akan menunjukkan:
```
✅ Google login success
🔐 User needs to set password
✅ Password set successfully for user
🔐 Google OAuth - User email@gmail.com, needsPassword: false
```

---

## Troubleshooting Deployment

### Issue: "Redirect URI mismatch" in Production

**Solution:**
1. Verify production domain di .env
2. Check Google Console credentials untuk production
3. Ensure HTTPS is working

### Issue: OTP not sending in Production

**Solution:**
1. Verify EMAIL_USER dan EMAIL_PASSWORD benar
2. Test email service:
   ```bash
   node -e "require('./services/emailService').initialize().then(r => console.log(r))"
   ```
3. Check Gmail app password configured

### Issue: Session not persisting

**Solution:**
1. Check JWT_SECRET dalam .env
2. Verify localStorage working (HTTPS)
3. Check cookie secure flag

---

## Rollback Plan

Jika ada masalah di production:

1. **Disable Google OAuth:**
   - Set `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` to empty
   - Restart backend
   - Frontend button akan disappear

2. **Keep existing users:**
   - Google users yang sudah set password tetap bisa login
   - Google users yang belum set password tidak bisa login (sampai password di-set)

3. **Restore from backup:**
   ```bash
   # Database backup
   mysqldump -u root beauty_clinic > backup_$(date +%Y%m%d).sql
   mysql -u root beauty_clinic < backup_YYYYMMDD.sql
   ```

---

## Success Criteria

✅ Google OAuth adalah sukses jika:
- Users bisa login dengan Google account
- New users automatically membuat account
- Email verification working (OTP sent & verified)
- Password setup working (min 8 chars)
- Users disimpan ke database dengan google_id
- Profile picture tersimpan
- Users bisa login lagi dengan yang sudah set password
- Error handling working
- Production deployment smooth

---

**Ready to test dan deploy!** 🚀

