# 📋 TEST CHECKLIST - PHOTO BEFORE UPLOAD

## ✅ Backend Fixes Applied:
- [x] Added `/uploads` static route in server.js
- [x] Multer configured in medicalRecordRoutes.js
- [x] API endpoints protected with authenticateToken
- [x] Database model supports file storage

## ✅ Frontend Improvements:
- [x] Enhanced error logging in component
- [x] Fixed FormData Content-Type header issue in api.js
- [x] Better error messages for debugging
- [x] Improved camera capture logging

## 🧪 Testing Steps:

### Step 1: Login as Member
- Go to `/member/appointment`
- Login with member account
- Click on appointment detail

### Step 2: Test Photo Upload
- Click "FOTO BEFORE" button
- Choose upload method:
  - **📸 Foto dari Kamera** - Use webcam
  - **📤 Upload dari Galeri** - Select existing photo

### Step 3: Verify Upload Success
- Look for success message
- Check browser console (F12) for logs
- Check server console for upload confirmation

### Step 4: Verify File Storage
- Go to: `server/public/uploads/medical_records/`
- Look for uploaded image file
- Check file naming: `before_photo_*.jpg`

## 🔍 Debugging Tips:

### If Upload Fails:
1. **Check Browser Console (F12)**
   - Look for error messages
   - Check Network tab for API response

2. **Check Server Console**
   - Look for multer file upload logs
   - Check for database insertion errors

3. **Verify Token**
   - Open DevTools > Storage > localStorage
   - Check if `token` exists and is valid

4. **Check File Permissions**
   - Ensure `server/public/uploads/medical_records/` exists
   - Verify folder has write permissions

### Common Issues & Solutions:

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Token expired - Login again |
| File not saving | Check folder permissions |
| FormData error | Clear browser cache & refresh |
| Camera not working | Check browser permissions |
| No image preview | Browser DevTools > Network tab |

## 📝 Expected Flow:

```
Member clicks "FOTO BEFORE"
    ↓
Modal opens with appointment details
    ↓
Choose upload/camera method
    ↓
File selected or photo captured
    ↓
Preview shows in modal
    ↓
Click "Simpan Foto"
    ↓
FormData sent to /api/medical-records POST
    ↓
Multer processes file upload
    ↓
File saved to server/public/uploads/medical_records/
    ↓
Database record created with image_url
    ↓
Success message displayed
    ↓
Modal closes
```

## 🔗 API Endpoints:

- **POST** `/api/medical-records` - Create with before_image
- **GET** `/uploads/medical_records/{filename}` - Access uploaded photo
- **GET** `/api/medical-records/appointment/{id}` - Get medical record

---

**Last Updated:** May 6, 2026
**Status:** Ready for Testing ✅
