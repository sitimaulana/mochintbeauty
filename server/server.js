const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

const { promisePool } = require('./config/database');
const createAllTables = require('./initTables'); 
const authenticateToken = require('./middleware/auth');

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const appointmentReminderRoutes = require('./routes/appointmentReminderRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');
const treatmentOptionsRoutes = require('./routes/treatmentOptionsRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const memberRoutes = require('./routes/memberRoutes');
const productRoutes = require('./routes/productsRoute');
const reviewsRoutes = require('./routes/reviewsRoutes');
const articlesRoutes = require('./routes/articlesRoutes');
const timeslotRoutes = require('./routes/timeslotRoutes');
const pageInfoRoutes = require('./routes/pageInfoRoutes');
const contactRoutes = require('./routes/contactRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');

// Import Reminder Service
const reminderService = require('./services/reminderService');

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration for passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'mochint_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport (lazy loaded when needed for Google OAuth)
try {
  const passport = require('./config/passport');
  app.use(passport.initialize());
  app.use(passport.session());
  console.log('✅ Passport initialized for Google OAuth');
} catch (error) {
  console.log('⚠️  Passport not initialized (Google OAuth will not work):', error.message);
}

// Initialize email service
const emailService = require('./services/emailService');
emailService.initialize().then(initialized => {
  if (initialized) {
    console.log('✅ Email service ready - OTP will be sent to actual emails');
  } else {
    console.log('⚠️  Email service not configured - Using development mode (OTP in console)');
  }
}).catch(err => {
  console.log('⚠️  Email service initialization error:', err.message);
});

// Initialize Appointment Reminder Service
if (process.env.REMINDER_SERVICE_ENABLED !== 'false') {
  reminderService.start().catch(err => {
    console.error('⚠️  Failed to start reminder service:', err.message);
  });
} else {
  console.log('⚠️  Reminder service disabled in .env');
}

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Debug: Log registered routes
console.log('\n📋 Registered API Routes:');
console.log('  ✅ /api/auth - Authentication routes');
console.log('  ✅ /api/treatments - Treatment routes');
console.log('  ✅ /api/therapists - Therapist routes');
console.log('  ✅ /api/products - Product routes');
console.log('  ✅ /api/reviews - Review routes');
console.log('  ✅ /api/articles - Article routes');
console.log('  ✅ /api/page-info - Page info routes');
console.log('  ✅ /api/contact - Contact routes');
console.log('  ✅ /api/appointments - Appointment routes (protected)');
console.log('  ✅ /api/reminders - Appointment Reminder routes (protected)');
console.log('  ✅ /api/members - Member routes (protected)');
console.log('  ✅ /api/timeslots - Timeslot routes (protected)');
console.log('  ✅ /api/medical-records - Medical Records routes (protected)\n');

// optional DB init (if file exists) - COMMENTED OUT UNTUK PRODUCTION
// if (createAllTables && typeof createAllTables === 'function') {
//   createAllTables(promisePool).catch(err => console.error('Init tables error:', err));
// }


// Public routes (no token required) - MUST BE BEFORE STATIC FILES
app.use('/api/auth', authRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewsRoutes); // Register route sekali saja
app.use('/api/articles', articlesRoutes);
app.use('/api/page-info', pageInfoRoutes); // Dynamic page content management
app.use('/api/contact', contactRoutes); // Contact information management

// Protected routes (require token) - MUST BE BEFORE STATIC FILES
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/reminders', authenticateToken, appointmentReminderRoutes);
app.use('/api/members', authenticateToken, memberRoutes);
app.use('/api/timeslots', authenticateToken, timeslotRoutes);
app.use('/api/medical-records', authenticateToken, medicalRecordRoutes);
app.use('/api/treatment-options', treatmentOptionsRoutes); // Categories and facilities management

app.get('/', (req, res) => {
  res.json({ message: 'Mochint Beauty Clinic API', version: '1.0' });
});

app.get('/health', async (req, res) => {
  try {
    await promisePool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve uploads with proper headers and MIME types
// Use express.static middleware with proper MIME type detection
const mime = require('mime-types');

app.use('/uploads', (req, res, next) => {
  // Set CORS headers for all upload requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  
  // Get the file extension and set proper MIME type
  const ext = path.extname(req.path).toLowerCase();
  const mimeType = mime.lookup(ext) || 'application/octet-stream';
  res.set('Content-Type', mimeType);
  
  next();
}, express.static(path.join(__dirname, 'public/uploads'), {
  maxAge: '1y',
  etag: false
}));

// NOW serve static files (after all API routes)
app.use(express.static(path.join(__dirname, '../dist')));

// PERHATIAN: Jangan gunakan tanda kutip (' atau ") di dalam kurung!
// Gunakan garis miring /.*/ yang merupakan format RegExp JavaScript.
// HANYA untuk GET requests (SPA routing)

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// 404 handler untuk method lain
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found', path: req.originalUrl, method: req.method });
});

// Pastikan app.listen tetap di paling bawah
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Local development: http://localhost:${PORT}`);
});