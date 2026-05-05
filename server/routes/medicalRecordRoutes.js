const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const medicalRecordController = require('../controllers/medicalRecordController');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads/medical_records');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, jpg, webp)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Routes

// GET /api/medical-records - Get all medical records
router.get('/', medicalRecordController.getAllMedicalRecords);

// GET /api/medical-records/:id - Get medical record by ID
router.get('/:id', medicalRecordController.getMedicalRecordById);

// GET /api/medical-records/appointment/:appointmentId - Get record by appointment ID
router.get('/appointment/:appointmentId', medicalRecordController.getMedicalRecordByAppointment);

// GET /api/medical-records/member/:memberId - Get records by member ID
router.get('/member/:memberId', medicalRecordController.getMedicalRecordsByMember);

// GET /api/medical-records/member/:memberId/completed - Get completed records by member
router.get('/member/:memberId/completed', medicalRecordController.getCompletedMedicalRecordsByMember);

// POST /api/medical-records - Create medical record with file upload
router.post(
  '/',
  upload.fields([
    { name: 'before_image', maxCount: 1 },
    { name: 'after_image', maxCount: 1 }
  ]),
  medicalRecordController.createMedicalRecord
);

// PUT /api/medical-records/:id - Update medical record
router.put(
  '/:id',
  upload.fields([
    { name: 'before_image', maxCount: 1 },
    { name: 'after_image', maxCount: 1 }
  ]),
  medicalRecordController.updateMedicalRecord
);

// PUT /api/medical-records/:id/status - Update status
router.put('/:id/status', medicalRecordController.updateMedicalRecordStatus);

// DELETE /api/medical-records/:id - Delete medical record
router.delete('/:id', medicalRecordController.deleteMedicalRecord);

module.exports = router;
