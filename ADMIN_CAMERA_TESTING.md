# 🧪 Admin Medical Records Camera Upload - Testing Guide

## Quick Test Steps

### Test 1: Upload "Before" Photo from Camera
1. Go to **Admin Dashboard** → **Appointments**
2. Find any appointment with status "Confirmed" or "Completed"
3. Click the **"📋 Medis"** button (Medical Records)
4. In the modal, look for **"Foto Sebelum Perawatan (Before)"** section
5. Click button: **"📸 Foto dari Kamera"**
6. Allow camera permission when prompted
7. Video stream should appear
8. Click **"📸 Ambil Foto"** to capture
9. Photo preview will show
10. Verify photo looks good, or click **"Ambil Ulang"** to retake
11. ✅ Photo is ready for saving

### Test 2: Upload "Before" Photo from File
1. Follow steps 1-4 from Test 1
2. In the modal, click button: **"📁 Upload dari Galeri"**
3. File picker opens
4. Select image from device
5. Photo preview will show
6. Verify file uploaded correctly
7. ✅ Photo is ready for saving

### Test 3: Switch Camera (Front ↔ Back)
1. Follow steps 1-8 from Test 1
2. After camera is active, click **"🔄 Ganti Kamera"**
3. Camera should switch to back/front
4. Verify it shows the different camera feed
5. ✅ Camera switching works

### Test 4: Upload "After" Photo
1. Follow steps 1-4 from Test 1
2. In the modal, look for **"Foto Setelah Perawatan (After)"** section
3. Upload photo (same as before)
4. ✅ After photo also supports camera/file upload

### Test 5: Save with Both Photos
1. Upload before photo (Test 1 or 2)
2. Upload after photo (Test 4)
3. Fill in other fields:
   - Diagnosis
   - Treatment Detail
   - Medical Notes (optional)
   - Recommendations (optional)
4. Click **"Simpan Rekam Medis"** button
5. Wait for success message
6. ✅ Medical records saved with both photos

### Test 6: Update Existing Record
1. Go to **Admin Dashboard** → **Appointments**
2. Find appointment that already has medical records
3. Click **"📋 Medis"** button
4. Modal opens with existing data and photos
5. You can now retake/reupload photos
6. Click "Ganti Foto" to replace existing photo
7. Update and save
8. ✅ Update works with new photos

### Test 7: Mobile Camera Test
1. Open on smartphone browser
2. Follow Test 1 or 2
3. For mobile, "back camera" is usually environment/landscape
4. "Front camera" is selfie/user camera
5. Both should work
6. ✅ Mobile camera support verified

### Test 8: Error Handling
1. Try upload file > 10MB → Should show error "File size must be less than 10MB"
2. Try upload non-image file → Should show error "Please upload an image file"
3. Deny camera permission → Should show error "Izin kamera ditolak"
4. If camera not found → Should show error "Kamera tidak ditemukan"
5. ✅ Error messages display correctly

## Visual Checks

### Before Upload Screen ✅
- Two buttons visible: "📸 Foto dari Kamera" and "📁 Upload dari Galeri"
- Both buttons styled with brown theme (#8D6E63)
- Clear labels with descriptions

### Camera Screen ✅
- Video stream displays in 16:9 aspect ratio
- Loading indicator shows "Mengaktifkan kamera..."
- Two buttons: "🔄 Ganti Kamera" and "📸 Ambil Foto"
- Cancel button visible
- Batal button shows

### Preview Screen ✅
- Photo displays clearly
- Delete (X) button in top right
- "Ganti Foto" button to retake
- Size matches container

## Browser Compatibility

Test on:
- [ ] Chrome (Windows/Mac/Android)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac/iOS)
- [ ] Edge (Windows)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

## Performance Checks

- [ ] Camera starts within 2-3 seconds
- [ ] Photo capture is instant
- [ ] Preview loads immediately
- [ ] No lag when switching cameras
- [ ] File upload is smooth

## Integration Checks

- [ ] Works from Appointment page modal
- [ ] Works from Medical Records page (if applicable)
- [ ] Saves correctly to database
- [ ] File storage in `/uploads/medical_records/`
- [ ] URLs display correctly in preview after save

---

## Expected Behavior

| Action | Expected Result | Status |
|--------|-----------------|--------|
| Click "📸 Foto dari Kamera" | Camera permission prompt | ✅ |
| Camera activates | Video stream shows | ✅ |
| Click "📸 Ambil Foto" | Photo captured, preview shows | ✅ |
| Click "🔄 Ganti Kamera" | Camera switches | ✅ |
| Click "Ambil Ulang" | Photo cleared, can retake | ✅ |
| Upload > 10MB file | Error message shows | ✅ |
| Upload non-image | Error message shows | ✅ |
| Save with photos | Both photos saved to DB | ✅ |
| View record again | Photos display from DB | ✅ |

---

**Test Date**: _________
**Tester**: _________
**Platform**: _________
**Result**: ✅ PASS / ❌ FAIL

