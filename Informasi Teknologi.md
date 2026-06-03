# 🌸 Mochint Beauty Care - Dokumentasi Lengkap

## 📋 Daftar Isi
1. [Pengenalan Aplikasi](#pengenalan-aplikasi)
2. [Fitur-Fitur Utama](#fitur-fitur-utama)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Arsitektur Sistem](#arsitektur-sistem)
5. [Alur Sistem Frontend](#alur-sistem-frontend)
6. [Alur Sistem Backend](#alur-sistem-backend)
7. [Database Schema](#database-schema)
8. [Setup & Instalasi](#setup--instalasi)
9. [Menjalankan Aplikasi](#menjalankan-aplikasi)
10. [API Endpoints](#api-endpoints)

---

## 🎯 Pengenalan Aplikasi

**Mochint Beauty Care** adalah sebuah platform web yang komprehensif untuk manajemen klinik kecantikan. Aplikasi ini dirancang untuk mengelola appointments, treatments, products, therapists, dan members dengan integrasi AI untuk analisis kulit.

**Tipe Aplikasi:** Web-based Management System (Full-Stack)
**Tujuan:** Memudahkan penjadwalan appointment, manajemen data member, produk, terapis, dan analisis kulit menggunakan AI

---

## ✨ Fitur-Fitur Utama

### 👥 **1. Autentikasi & Manajemen User**
- ✅ Login/Register dengan Email & Password
- ✅ Google OAuth Integration (Login dengan Google)
- ✅ Email OTP Verification
- ✅ Forgot Password functionality
- ✅ Set Password setelah Google OAuth
- ✅ Role-based Access Control (Admin, Member, Therapist)
- ✅ JWT Token-based Authentication

### 📅 **2. Manajemen Appointment**
- ✅ Booking appointment dengan 3-step flow
  - Step 1: Pilih Treatment & Layanan
  - Step 2: Pilih Terapis & Waktu
  - Step 3: Review & Confirm Booking
- ✅ View booking history dan upcoming appointments
- ✅ Cancel atau reschedule appointment
- ✅ Reminder email otomatis sebelum appointment
- ✅ Appointment management untuk Admin & Therapist

### 💄 **3. Manajemen Treatments & Products**
- ✅ CRUD operations untuk Treatments
- ✅ CRUD operations untuk Products
- ✅ Treatment dengan berbagai options/variants
- ✅ Kategorisasi produk & treatment
- ✅ Harga management
- ✅ Public product showcase di halaman public

### 👨‍⚕️ **4. Manajemen Terapis**
- ✅ Database terapis dengan detail
- ✅ Jadwal ketersediaan terapis
- ✅ Rating & review dari member
- ✅ Medical record terasosiasi

### 👤 **5. Manajemen Member**
- ✅ Member profile management
- ✅ Medical records & history
- ✅ Appointment history
- ✅ Preferensi layanan

### 🤖 **6. AI Skin Analysis**
- ✅ Analisis kulit menggunakan AI/ML Model (PyTorch)
- ✅ Upload foto untuk analisis
- ✅ Deteksi kondisi kulit
- ✅ Rekomendasi treatment berdasarkan hasil analisis
- ✅ Save hasil analisis ke database

### 📝 **7. Content Management**
- ✅ Management Blog/Articles
- ✅ Page content management (About, Information)
- ✅ Promo management
- ✅ SEO-friendly content display

### 📞 **8. Komunikasi**
- ✅ Contact form untuk public inquiries
- ✅ Email notifications
- ✅ Appointment reminders
- ✅ OTP via email

### ⭐ **9. Review & Rating**
- ✅ Member dapat memberikan review
- ✅ Rating untuk terapis & treatments
- ✅ Display featured reviews di homepage

---

## 🛠️ Teknologi yang Digunakan

### **Frontend Stack**
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.2.0 | UI Framework |
| React Router DOM | 6.20.0 | Client-side routing |
| Vite | 7.3.1 | Build tool & dev server |
| Tailwind CSS | 3.4.19 | Styling & utility-first CSS |
| Axios | 1.13.2 | HTTP client |
| Lucide React | 0.562.0 | Icon library |
| Swiper | 12.0.3 | Carousel component |
| jsPDF & html2canvas | 4.2.1, 1.4.1 | PDF export |
| date-fns | 4.1.0 | Date utilities |
| universal-cookie | 8.0.1 | Cookie management |

### **Backend Stack**
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Node.js | - | Runtime environment |
| Express.js | 4.22.1 | Web framework |
| MySQL | 8.0 | Database |
| mysql2 | 3.16.2 | MySQL driver |
| Passport.js | 0.7.0 | Authentication middleware |
| JWT | 9.0.3 | Token-based auth |
| Nodemailer | 8.0.1 | Email service |
| Multer | 1.4.4 | File upload handling |
| Bcrypt/Bcryptjs | 6.0.0, 3.0.3 | Password hashing |
| CORS | 2.8.6 | Cross-origin requests |
| Swagger UI | 5.0.1 | API documentation |
| Express Session | 1.19.0 | Session management |

### **AI/ML Stack**
| Teknologi | Fungsi |
|-----------|--------|
| PyTorch | Deep learning framework |
| Python | ML model processing |
| Pre-trained Model | mochint_model.pth |

### **Infrastructure**
| Teknologi | Fungsi |
|-----------|--------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| phpMyAdmin | Database management UI |

---

## 🏗️ Arsitektur Sistem

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT SIDE (Browser)                      │
│              React + Vite + Tailwind CSS                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Public     │  │   Member     │  │     Admin       │   │
│  │   Pages      │  │   Dashboard  │  │   Dashboard     │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Auth Pages  │  │   AI Skin    │  │   Booking       │   │
│  │              │  │   Analysis   │  │   System        │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST API (Axios)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼──────────────────────────┐  ┌──────▼────────────────┐
│   EXPRESS.JS BACKEND             │  │   Python ML Server    │
│   Port: 5000                     │  │   (AI Analysis)       │
│                                  │  │   Model: PyTorch      │
│  ┌────────────────────────────┐  │  └─────────────────────┘
│  │     API Routes:            │  │
│  │  • /api/auth               │  │
│  │  • /api/appointments       │  │
│  │  • /api/treatments         │  │
│  │  • /api/therapists         │  │
│  │  • /api/members            │  │
│  │  • /api/products           │  │
│  │  • /api/reviews            │  │
│  │  • /api/articles           │  │
│  │  • /api/ai-skin-analysis   │  │
│  │  • /api/page-info          │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Middleware:               │  │
│  │  • JWT Authentication      │  │
│  │  • CORS                    │  │
│  │  • Session Management      │  │
│  │  • Passport (OAuth)        │  │
│  └────────────────────────────┘  │
└───────┬──────────────────────────┘
        │
        │ MySQL Protocol
        │
┌───────▼──────────────────────────┐
│   MySQL Database (Port: 3306)    │
│   • Members                       │
│   • Appointments                  │
│   • Treatments                    │
│   • Therapists                    │
│   • Products                      │
│   • Reviews                       │
│   • Articles                      │
│   • Medical Records               │
└──────────────────────────────────┘
```

### **Component Hierarchy (Frontend)**

```
App.jsx
├── AppRoutes.jsx
│   ├── PublicLayout
│   │   ├── Home Page
│   │   ├── About Page
│   │   ├── Treatment Page (Public)
│   │   ├── Product Page (Public)
│   │   ├── Information Page
│   │   ├── Information Detail
│   │   ├── Promo Page
│   │   ├── AI Skin Analysis Page
│   │   └── Contact Form
│   │
│   ├── AuthLayout
│   │   ├── Login Page
│   │   ├── Register Page
│   │   ├── Email Verification
│   │   ├── Set Password (OAuth)
│   │   ├── Forgot Password
│   │   └── Google Callback
│   │
│   ├── MemberLayout
│   │   ├── Member Dashboard
│   │   ├── Member Profile
│   │   ├── Appointment History
│   │   ├── Booking Flow (3-step)
│   │   │   ├── BookingStep1 (Select Treatment)
│   │   │   ├── BookingStep2 (Select Therapist/Time)
│   │   │   ├── BookingStep3 (Review & Confirm)
│   │   │   └── BookingSuccess
│   │   └── Appointment Detail
│   │
│   └── AdminLayout
│       ├── Admin Dashboard
│       ├── Appointment Management
│       ├── Member Management
│       ├── Treatment Management
│       ├── Product Management
│       ├── Therapist Management
│       ├── Therapist Detail
│       ├── Review Management
│       ├── Page Content Management
│       ├── Information Management
│       └── Bed Management
│
├── Contexts (State Management)
│   ├── MemberContext
│   ├── AppointmentContext
│   ├── TherapistContext
│   └── TreatmentContext
│
└── Services
    ├── API Service (apiConfig, client)
    └── PDF Export Service
```

### **Database Schema Relationship**

```
┌──────────────────┐
│    Members       │
├──────────────────┤
│ member_id (PK)   │
│ email            │
│ name             │
│ phone            │
│ address          │
│ created_at       │
└─────┬────────────┘
      │
      ├──────────────────────┐
      │                      │
      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐
│ Appointments     │  │ Medical Records  │
├──────────────────┤  ├──────────────────┤
│ appointment_id   │  │ record_id (PK)   │
│ member_id (FK)   │  │ member_id (FK)   │
│ therapist_id(FK) │  │ history          │
│ treatment_id(FK) │  │ created_at       │
│ date             │  └──────────────────┘
│ time             │
│ status           │
└────────┬─────────┘
         │
    ┌────┴─────┐
    │           │
    ▼           ▼
┌──────────────────┐  ┌──────────────────┐
│  Treatments      │  │  Therapists      │
├──────────────────┤  ├──────────────────┤
│ treatment_id(PK) │  │ therapist_id(PK) │
│ name             │  │ name             │
│ description      │  │ specialization   │
│ price            │  │ experience       │
│ duration         │  │ phone            │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Treatment        │  │ Therapist        │
│ Options          │  │ Reviews          │
├──────────────────┤  ├──────────────────┤
│ option_id(PK)    │  │ review_id(PK)    │
│ treatment_id(FK) │  │ therapist_id(FK) │
│ name             │  │ member_id(FK)    │
│ price            │  │ rating           │
│ description      │  │ comment          │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│   Products       │  │   Articles       │
├──────────────────┤  ├──────────────────┤
│ product_id(PK)   │  │ article_id(PK)   │
│ name             │  │ title            │
│ price            │  │ content          │
│ description      │  │ author           │
│ category         │  │ created_at       │
│ stock            │  └──────────────────┘
└──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│   Reviews        │  │  Appointment     │
├──────────────────┤  │  Reminders       │
│ review_id(PK)    │  ├──────────────────┤
│ appointment_id   │  │ reminder_id(PK)  │
│ member_id(FK)    │  │ appointment_id   │
│ rating           │  │ reminder_time    │
│ comment          │  │ sent             │
│ created_at       │  └──────────────────┘
└──────────────────┘
```

---

## 🎨 Alur Sistem Frontend

### **1. Authentication Flow**

```
START
  │
  ├─→ [User] → Visit /login
  │     │
  │     ├─→ Manual Login
  │     │     ├─ Input Email & Password
  │     │     ├─ POST /api/auth/login
  │     │     ├─ Receive JWT Token + User Data
  │     │     ├─ Store in localStorage
  │     │     └─ Redirect based on role
  │     │
  │     └─→ Google OAuth Login
  │           ├─ Click "Login with Google"
  │           ├─ GET /api/auth/google
  │           ├─ Google consent screen
  │           ├─ GET /api/auth/google/callback
  │           ├─ Receive JWT + User Data
  │           ├─ Check if first time (needs password)
  │           │   ├─ YES → Redirect /set-password
  │           │   └─ NO → Redirect to dashboard
  │           └─ Store token & proceed
  │
  ├─→ [User] → Visit /register
  │     ├─ Input Email, Name, Password
  │     ├─ POST /api/auth/register
  │     ├─ Receive Email Verification Link
  │     ├─ Check Email & Click Verification Link
  │     ├─ GET /api/auth/verify-email (via URL token)
  │     └─ Account Activated → Redirect to /login
  │
  ├─→ Forgot Password Flow
  │     ├─ Click "Forgot Password"
  │     ├─ Input Email
  │     ├─ POST /api/auth/send-otp
  │     ├─ Receive OTP in Email
  │     ├─ Input OTP
  │     ├─ POST /api/auth/verify-otp
  │     ├─ POST /api/auth/set-password (new password)
  │     └─ Redirect to /login
  │
  └─→ JWT Token Validation (on every request)
        ├─ Check localStorage for 'token'
        ├─ Include Authorization header
        ├─ Backend validates token
        └─ If invalid → Logout & Redirect /login

END
```

### **2. Member Booking Flow**

```
START
  │
  └─→ [Member] → Click "Book Appointment" (dari Public/Dashboard)
        │
        ├─→ Protected Route Check
        │     ├─ Token exists? YES → Continue
        │     └─ NO → Redirect /login
        │
        ├─→ Step 1: Select Treatment
        │     ├─ GET /api/treatments (fetch all treatments)
        │     ├─ GET /api/treatments/{id}/options (fetch treatment options)
        │     ├─ Display Treatment cards dengan price, duration
        │     ├─ Member select treatment + option
        │     └─ Click "Next" → Go to Step 2
        │
        ├─→ Step 2: Select Therapist & Time
        │     ├─ GET /api/timeslots?date=... (filter by date)
        │     ├─ GET /api/therapists (fetch available therapists)
        │     ├─ Display calendar untuk memilih tanggal
        │     ├─ Display available therapists dengan rating
        │     ├─ Display time slots (booked vs available)
        │     ├─ Member select therapist + date + time
        │     └─ Click "Next" → Go to Step 3
        │
        ├─→ Step 3: Review & Confirm
        │     ├─ Display booking summary
        │     │   ├─ Treatment name & option
        │     │   ├─ Therapist name
        │     │   ├─ Date & Time
        │     │   ├─ Total Price
        │     │   └─ Estimated Duration
        │     ├─ Member review details
        │     ├─ Click "Confirm" → POST /api/appointments
        │     └─ Handle response (success/error)
        │
        └─→ Success Page
              ├─ Display "Booking Confirmed!"
              ├─ Show Confirmation Number
              ├─ Show appointment details
              ├─ Option to download PDF receipt
              ├─ Button "View Appointment" atau "Back to Dashboard"
              └─ Email confirmation sent

END
```

### **3. Member Dashboard Flow**

```
START
  │
  └─→ [Member] → Access /member
        │
        ├─→ Protected Route + MemberLayout
        │     └─ Check role = 'member' | 'user'
        │
        ├─→ Dashboard Home
        │     ├─ GET /api/members/{id} (fetch profile)
        │     ├─ GET /api/appointments (fetch upcoming appointments)
        │     ├─ GET /api/reviews (fetch member's reviews)
        │     │
        │     ├─ Display Welcome Card
        │     ├─ Display Upcoming Appointments (max 3)
        │     ├─ Display Quick Stats
        │     │   ├─ Total appointments
        │     │   ├─ Last visit date
        │     │   └─ Favorite therapist
        │     │
        │     └─ Action Buttons
        │         ├─ "Book Appointment"
        │         ├─ "View History"
        │         ├─ "Profile Settings"
        │         └─ "AI Skin Analysis"
        │
        ├─→ Profile Page (/member/profile)
        │     ├─ GET /api/members/{id}
        │     ├─ Display Member Info
        │     ├─ Edit Form (with PUT /api/members/{id})
        │     ├─ Medical History Section
        │     └─ Save Changes
        │
        ├─→ Appointment History (/member/history)
        │     ├─ GET /api/appointments (member's all appointments)
        │     ├─ Filter: Past, Upcoming
        │     ├─ Display list dengan status badges
        │     ├─ Click appointment → View Detail
        │     ├─ Action: Cancel/Reschedule/Leave Review
        │     └─ Pagination
        │
        └─→ AI Skin Analysis (/ai-skin-analysis)
              ├─ Upload Photo
              ├─ POST /api/ai-skin-analysis/analyze
              ├─ Wait for processing (Python backend)
              ├─ Display Results
              │   ├─ Skin type classification
              │   ├─ Condition assessment
              │   ├─ Problem areas
              │   └─ Recommended treatments
              ├─ Save result to database
              └─ Option to book recommended treatment

END
```

### **4. AI Skin Analysis Flow**

```
START
  │
  └─→ [Member/User] → Click "AI Skin Analysis"
        │
        ├─→ AISkinAnalysisPage (/features/AISkinAnalysis)
        │     │
        │     ├─→ Upload Photo
        │     │     ├─ Select image from device
        │     │     ├─ Preview image
        │     │     ├─ Validate file (image only)
        │     │     └─ Click "Analyze"
        │     │
        │     ├─→ Frontend → Backend API
        │     │     ├─ POST /api/ai-skin-analysis/analyze
        │     │     ├─ Payload: {image_file, member_id, ...}
        │     │     └─ Content-Type: multipart/form-data
        │     │
        │     ├─→ Backend → Python ML Server
        │     │     ├─ Receive image
        │     │     ├─ Preprocess image
        │     │     ├─ Load PyTorch model (mochint_model.pth)
        │     │     ├─ Run inference
        │     │     ├─ Extract predictions
        │     │     └─ Return results to backend
        │     │
        │     ├─→ Backend → Database
        │     │     ├─ Save analysis result
        │     │     ├─ Link to member_id
        │     │     ├─ Store timestamp
        │     │     └─ Store model output
        │     │
        │     └─→ Display Results to Frontend
        │           ├─ Skin Type Classification
        │           │   ├─ Normal, Oily, Dry, Combination
        │           │   └─ Confidence score
        │           │
        │           ├─ Skin Conditions Detected
        │           │   ├─ Acne, Wrinkles, Pigmentation
        │           │   └─ Severity level
        │           │
        │           ├─ Problem Areas Heatmap
        │           │   └─ Visual overlay on image
        │           │
        │           ├─ Treatment Recommendations
        │           │   ├─ Suggested treatments
        │           │   ├─ Recommended products
        │           │   └─ Price estimates
        │           │
        │           └─ Action Buttons
        │               ├─ "Book Recommended Treatment"
        │               ├─ "View Products"
        │               ├─ "Save Analysis"
        │               └─ "Download Report"

END
```

### **5. Admin Dashboard Flow**

```
START
  │
  └─→ [Admin] → Access /admin
        │
        ├─→ Protected Route + AdminLayout
        │     └─ Check role = 'admin'
        │
        ├─→ Dashboard Home
        │     ├─ GET /api/appointments (all appointments stats)
        │     ├─ GET /api/members (total members)
        │     ├─ GET /api/products (product stats)
        │     │
        │     ├─ Display Charts & Statistics
        │     │   ├─ Appointments count by month
        │     │   ├─ Revenue stats
        │     │   ├─ Member growth
        │     │   └─ Popular treatments
        │     │
        │     └─ Quick Action Buttons
        │
        ├─→ Appointment Management (/admin/appointments)
        │     ├─ GET /api/appointments (all appointments)
        │     ├─ Display table dengan filters
        │     ├─ Update appointment status (done, cancelled)
        │     ├─ Assign therapist
        │     └─ Send reminder
        │
        ├─→ Member Management (/admin/members)
        │     ├─ GET /api/members (all members)
        │     ├─ View member profile
        │     ├─ Edit member info (PUT /api/members/{id})
        │     ├─ View appointment history
        │     ├─ View medical records
        │     └─ Delete member account
        │
        ├─→ Treatment Management (/admin/treatments)
        │     ├─ GET /api/treatments (all treatments)
        │     ├─ Create treatment (POST)
        │     ├─ Edit treatment (PUT)
        │     ├─ Delete treatment (DELETE)
        │     ├─ Manage treatment options
        │     └─ Set prices & durations
        │
        ├─→ Product Management (/admin/products)
        │     ├─ GET /api/products (all products)
        │     ├─ Create product (POST)
        │     ├─ Edit product (PUT)
        │     ├─ Delete product (DELETE)
        │     ├─ Upload product images
        │     └─ Manage inventory
        │
        ├─→ Therapist Management (/admin/therapists)
        │     ├─ GET /api/therapists (all therapists)
        │     ├─ Create therapist (POST)
        │     ├─ Edit therapist (PUT)
        │     ├─ Delete therapist (DELETE)
        │     ├─ Manage availability
        │     └─ View therapist detail & schedule
        │
        ├─→ Review Management (/admin/reviews)
        │     ├─ GET /api/reviews (all reviews)
        │     ├─ Display review list
        │     ├─ Filter by rating
        │     ├─ Approve/Reject reviews
        │     ├─ Delete inappropriate reviews
        │     └─ View review analytics
        │
        ├─→ Content Management (/admin/page-content)
        │     ├─ GET /api/page-info (page content)
        │     ├─ Edit About page
        │     ├─ Edit services description
        │     ├─ Edit footer content
        │     ├─ POST/PUT changes
        │     └─ Preview before publish
        │
        └─→ Information Management (/admin/information)
              ├─ GET /api/articles (all articles/info)
              ├─ Create article (POST)
              ├─ Edit article (PUT)
              ├─ Delete article (DELETE)
              └─ Manage categories

END
```

---

## 🔌 Alur Sistem Backend

### **1. Request/Response Flow**

```
┌─────────────────────────────────────┐
│   Frontend (React) sends Request    │
│   Method: GET/POST/PUT/DELETE       │
│   Headers: Authorization: Bearer... │
│   Body: JSON (if applicable)        │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               │
┌──────────────▼──────────────────────┐
│   Express.js Server (Port 5000)     │
├──────────────────────────────────────┤
│ 1. CORS Middleware                  │
│    ├─ Allow cross-origin requests   │
│    └─ Check allowed methods         │
│                                     │
│ 2. Body Parser                      │
│    ├─ Parse JSON (max 50MB)         │
│    └─ Parse URL-encoded data        │
│                                     │
│ 3. Session Management               │
│    ├─ Initialize session            │
│    ├─ Load passport strategies      │
│    └─ Handle OAuth state            │
│                                     │
│ 4. Request Logger                   │
│    ├─ Log timestamp, method, URL    │
│    └─ Track incoming requests       │
│                                     │
│ 5. Route Handler                    │
│    ├─ Match URL to route            │
│    ├─ Extract parameters            │
│    └─ Pass to middleware/controller │
│                                     │
│ 6. Middleware (Specific)            │
│    ├─ JWT Authentication            │
│    ├─ Role-based authorization      │
│    ├─ Multer (file upload)          │
│    └─ Custom validation             │
│                                     │
│ 7. Controller                       │
│    ├─ Process business logic        │
│    ├─ Query database                │
│    ├─ Call services                 │
│    └─ Handle errors                 │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
   DATABASE    EMAIL/EXTERNAL
   (MySQL)       SERVICES
       │                │
       └───────┬────────┘
               │
┌──────────────▼──────────────────────┐
│   Return Response                   │
│   Status: 200, 201, 400, 404, 500   │
│   Body: JSON with data/error        │
└──────────────┬──────────────────────┘
               │
               │
┌──────────────▼──────────────────────┐
│   Frontend receives & processes     │
│   Update UI / Show notification     │
│   Store data in state/context       │
└──────────────────────────────────────┘
```

### **2. Authentication & Authorization Flow**

```
┌──────────────────────────────────────────────┐
│              LOGIN REQUEST                   │
└────────────────┬─────────────────────────────┘
                 │ POST /api/auth/login
                 │ {email, password}
                 │
        ┌────────▼────────┐
        │   authController.login()
        └────────┬────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐        ┌─────────────┐
│ Find User   │        │  Validate   │
│ by Email    │        │  Email      │
│ in Database │        │  Format     │
└─────────────┘        └─────────────┘
    │                         │
    └────────────┬────────────┘
                 │
        ┌────────▼────────┐
        │  bcrypt.compare │
        │ (password hash) │
        └────────┬────────┘
                 │
          ┌──────┴──────┐
          │ Match?      │
          YES    NO    │
          │     └─────→ Return 401 Unauthorized
          │
        ┌─▼──────────────────────────┐
        │  Generate JWT Token        │
        │  {user_id, role, email}    │
        │  Expires: 24 hours         │
        └─┬──────────────────────────┘
          │
        ┌─▼──────────────────────────┐
        │  Return Response:          │
        │  {                         │
        │   token: "jwt...",         │
        │   user: {...},             │
        │   role: "member|admin"     │
        │  }                         │
        └─┬──────────────────────────┘
          │
    ┌─────▼─────┐
    │   Frontend
    │ localStorage
    │  ["token"]
    └───────────┘

        ┌──────────────────────────────────────┐
        │   PROTECTED REQUEST WITH TOKEN      │
        │   GET /api/members/profile          │
        │   Header: Authorization: Bearer.... │
        └──────────┬───────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │ JWT Middleware    │
         │ authenticateToken │
         └─────────┬─────────┘
                   │
        ┌──────────┴──────────┐
        │ Extract token from  │
        │ Authorization       │
        │ header              │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │ Verify token with   │
        │ JWT_SECRET          │
        └──────────┬──────────┘
                   │
            ┌──────┴──────┐
            │ Valid?      │
        ┌───YES    NO     │
        │  │     └─────────→ Return 403 Forbidden
        │  │
        │  └─→ Extract user data
        │      {user_id, role, email}
        │
        └──→ Check Role-Based Access
               req.user.role
               ├─ "admin"   → Allow admin routes
               ├─ "member"  → Allow member routes
               └─ "therapist" → Allow therapist routes

        If role not allowed → 403 Forbidden
        If allowed → next() → Continue to controller
```

### **3. Appointment Booking Backend Flow**

```
┌─────────────────────────────────────┐
│   POST /api/appointments            │
│   Body: {                           │
│     member_id,                      │
│     therapist_id,                   │
│     treatment_id,                   │
│     appointment_date,               │
│     appointment_time,               │
│     notes                           │
│   }                                 │
└────────────┬────────────────────────┘
             │
    ┌────────▼────────┐
    │ appointmentController.create()
    └────────┬────────┘
             │
    ┌────────▼────────────────────────────┐
    │ 1. Validate Request                 │
    │    ├─ Check all required fields     │
    │    ├─ Validate date format         │
    │    ├─ Check if date is future      │
    │    └─ Validate time format         │
    └────────┬────────────────────────────┘
             │
    ┌────────▼────────────────────────────┐
    │ 2. Check Business Rules             │
    │    ├─ Member exists?               │
    │    ├─ Therapist exists?            │
    │    ├─ Treatment exists?            │
    │    ├─ Therapist available at time? │
    │    └─ No double-booking?           │
    └────────┬────────────────────────────┘
             │
         ┌───┴────┐
         │ All OK?│
         YES   NO │
         │     └──→ Return 400 Bad Request
         │
    ┌────▼────────────────────────────┐
    │ 3. Insert Appointment            │
    │    INSERT INTO appointments      │
    │    (member_id, therapist_id,     │
    │     treatment_id, date, time,    │
    │     status, created_at)          │
    │                                  │
    │ SET appointment_id = LAST_INSERT │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │ 4. Update Therapist Schedule    │
    │    ├─ Mark time slot as booked  │
    │    ├─ Update availability       │
    │    └─ Store appointment_id      │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │ 5. Send Confirmation Email      │
    │    ├─ Using emailService        │
    │    ├─ To member email           │
    │    ├─ Include appointment #     │
    │    ├─ Include appointment time  │
    │    └─ Include confirmation link │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │ 6. Schedule Reminder Email      │
    │    ├─ Queue reminder for 24h    │
    │    │  before appointment        │
    │    ├─ Store in reminders table  │
    │    └─ reminderService will send │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────┐
    │ 7. Return Success Response      │
    │ {                               │
    │   success: true,                │
    │   appointment: {...},           │
    │   appointment_id: 123,          │
    │   confirmation_number: "A-123"  │
    │ }                               │
    └────────────────────────────────┘
```

### **4. Email Service Flow**

```
┌──────────────────────────────────────────┐
│   Trigger: New Appointment Booking       │
└──────────┬───────────────────────────────┘
           │
    ┌──────▼──────┐
    │ emailService.sendConfirmation()
    └──────┬──────┘
           │
    ┌──────▼────────────────────────┐
    │ Prepare Email Content         │
    │ ├─ Load template              │
    │ ├─ Replace placeholders       │
    │ │  {member_name,              │
    │ │   appointment_date,         │
    │ │   therapist_name,           │
    │ │   treatment_name,           │
    │ │   confirmation_number}      │
    │ └─ Convert to HTML            │
    └──────┬────────────────────────┘
           │
    ┌──────▼────────────────────────┐
    │ Setup Nodemailer              │
    │ ├─ Gmail SMTP config          │
    │ ├─ EMAIL_USER env             │
    │ ├─ EMAIL_PASSWORD env (app)   │
    │ └─ Security: Enable 2FA       │
    └──────┬────────────────────────┘
           │
    ┌──────▼────────────────────────┐
    │ Send Email                    │
    │ transporter.sendMail({        │
    │   from: SENDER_EMAIL,         │
    │   to: member_email,           │
    │   subject: "Konfirmasi...",   │
    │   html: content,              │
    │   attachments: [...]          │
    │ })                            │
    └──────┬────────────────────────┘
           │
      ┌────┴─────┐
      │ Success? │
     YES    NO   │
      │     └────→ Log error, retry
      │           or notify admin
      │
   ┌──▼──────────────────────────┐
   │ Log send status             │
   │ in email_logs table         │
   │ ├─ timestamp                │
   │ ├─ recipient                │
   │ ├─ status (sent/failed)     │
   │ └─ error message (if any)   │
   └─────────────────────────────┘

    ┌──────────────────────────────────────────┐
    │   Reminder Email (Scheduled)             │
    │   24 hours before appointment            │
    └──────────┬───────────────────────────────┘
               │
    ┌──────────▼──────────────┐
    │ reminderService (cron)  │
    │ Runs every X minutes    │
    └──────────┬──────────────┘
               │
    ┌──────────▼──────────────────────────────┐
    │ Query reminders table:                  │
    │ SELECT * FROM appointment_reminders     │
    │ WHERE sent = false                      │
    │ AND reminder_time <= NOW()              │
    └──────────┬──────────────────────────────┘
               │
    ┌──────────▼──────────────────────────────┐
    │ For each reminder:                      │
    │ ├─ Get appointment details              │
    │ ├─ Get member email                     │
    │ ├─ Send reminder email                  │
    │ ├─ Mark reminder as sent                │
    │ └─ Update sent timestamp                │
    └────────────────────────────────────────┘
```

### **5. AI Skin Analysis Backend Flow**

```
┌──────────────────────────────────────┐
│   POST /api/ai-skin-analysis/analyze │
│   Content-Type: multipart/form-data  │
│   Files: {image_file},               │
│   Data: {member_id, ...}             │
└──────────┬───────────────────────────┘
           │
    ┌──────▼──────────────────────┐
    │ aiSkinAnalysisController    │
    │ .analyzeImage()             │
    └──────┬──────────────────────┘
           │
    ┌──────▼──────────────────────────────┐
    │ 1. Validate Request                 │
    │    ├─ Check image file exists       │
    │    ├─ Validate file type (image)    │
    │    ├─ Validate file size (max 10MB) │
    │    ├─ Check member_id exists        │
    │    └─ Check JWT auth                │
    └──────┬──────────────────────────────┘
           │
    ┌──────▼──────────────────────────────┐
    │ 2. Save Uploaded Image              │
    │    ├─ Generate unique filename      │
    │    ├─ Save to /public/uploads/      │
    │    ├─ Create image path reference   │
    │    └─ Store path in database        │
    └──────┬──────────────────────────────┘
           │
    ┌──────▼──────────────────────────────┐
    │ 3. Call Python ML Service           │
    │    POST http://python-server/       │
    │    Body: {                          │
    │      image_path,                    │
    │      model_type: "mochint"          │
    │    }                                │
    └──────┬──────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────┐
    │   PYTHON ML SERVER              │
    │   (Separate Process/Port)       │
    │                                 │
    │ 1. Receive image path           │
    │ 2. Load image from disk         │
    │ 3. Preprocess image             │
    │    ├─ Resize to model input     │
    │    ├─ Normalize pixel values    │
    │    ├─ Convert to tensor         │
    │    └─ Move to GPU (if available)│
    │ 4. Load PyTorch model           │
    │    ├─ Load mochint_model.pth    │
    │    ├─ Set to eval mode          │
    │    └─ No gradient calculation   │
    │ 5. Run inference                │
    │    ├─ model.forward(tensor)     │
    │    ├─ Get predictions           │
    │    └─ Calculate confidences     │
    │ 6. Post-process results         │
    │    ├─ Convert tensor to numpy   │
    │    ├─ Map to labels             │
    │    ├─ Extract top predictions   │
    │    └─ Generate heatmaps         │
    │ 7. Return JSON response         │
    │ {                               │
    │   skin_type: "oily",            │
    │   confidence: 0.92,             │
    │   conditions: [{                │
    │     name: "acne",               │
    │     severity: "moderate",       │
    │     confidence: 0.85            │
    │   }],                           │
    │   heatmap: "base64_encoded"     │
    │ }                               │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ 4. Receive ML Results from       │
    │    Python Server                │
    │    (Back to Node Backend)        │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ 5. Store Results in Database    │
    │    INSERT INTO                  │
    │    ai_analysis_results          │
    │    (member_id, image_path,      │
    │     skin_type, conditions,      │
    │     heatmap, created_at)        │
    │                                 │
    │    analysis_id = LAST_INSERT    │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ 6. Generate Recommendations     │
    │    Query treatments table       │
    │    WHERE category MATCHES       │
    │    detected skin condition      │
    │                                 │
    │    Query products table         │
    │    WHERE suitable_for =         │
    │    detected skin type           │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────────┐
    │ 7. Return Response to Frontend  │
    │ {                               │
    │   success: true,                │
    │   analysis_id: 456,             │
    │   results: {...},               │
    │   recommendations: {            │
    │     treatments: [...],          │
    │     products: [...]             │
    │   }                             │
    │ }                               │
    └─────────────────────────────────┘
```

### **6. Database Query Flow (Example)**

```
┌────────────────────────────────────────┐
│   GET /api/members/:id                 │
│   Header: Authorization: Bearer...     │
└────────┬─────────────────────────────────┘
         │
    ┌────▼─────────────────────────────┐
    │ memberController.getById()      │
    └────┬─────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────┐
    │ 1. Extract and validate params          │
    │    ├─ member_id from URL params         │
    │    ├─ req.user.id from JWT              │
    │    ├─ Check if user can access          │
    │    │  (own profile or admin)            │
    │    └─ Validate member_id is numeric     │
    └────┬─────────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────┐
    │ 2. Execute Query                        │
    │    const [rows] = await              │
    │    db.query(                           │
    │      'SELECT * FROM members            │
    │       WHERE member_id = ?',           │
    │      [member_id]                       │
    │    );                                  │
    └────┬─────────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────┐
    │ 3. Process Results                      │
    │    ├─ Check if member exists           │
    │    ├─ Format response data             │
    │    ├─ Remove sensitive data            │
    │    │  (password hash, tokens)          │
    │    └─ Add computed fields              │
    │       (age from birthdate, etc)        │
    └────┬─────────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────┐
    │ 4. Return Response                      │
    │    res.json({                           │
    │      success: true,                     │
    │      data: {                            │
    │        member_id,                       │
    │        name,                            │
    │        email,                           │
    │        phone,                           │
    │        address,                         │
    │        created_at,                      │
    │        appointment_count: 5             │
    │      }                                  │
    │    })                                   │
    └────────────────────────────────────────┘
```

---

## 💾 Database Schema

### **Tables Overview**

```sql
-- Members Table
CREATE TABLE members (
  member_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  birth_date DATE,
  user_type ENUM('user', 'member', 'admin'),
  google_id VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Treatments Table
CREATE TABLE treatments (
  treatment_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  duration INT, -- in minutes
  base_price DECIMAL(10, 2),
  category VARCHAR(50),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment Options Table
CREATE TABLE treatment_options (
  option_id INT PRIMARY KEY AUTO_INCREMENT,
  treatment_id INT NOT NULL,
  name VARCHAR(100),
  additional_price DECIMAL(10, 2),
  FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id)
);

-- Therapists Table
CREATE TABLE therapists (
  therapist_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  specialization VARCHAR(100),
  experience_years INT,
  bio TEXT,
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timeslots Table
CREATE TABLE timeslots (
  timeslot_id INT PRIMARY KEY AUTO_INCREMENT,
  therapist_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  appointment_id INT,
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- Appointments Table
CREATE TABLE appointments (
  appointment_id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  therapist_id INT NOT NULL,
  treatment_id INT NOT NULL,
  treatment_option_id INT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
  notes TEXT,
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(member_id),
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id),
  FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id),
  FOREIGN KEY (treatment_option_id) REFERENCES treatment_options(option_id)
);

-- Products Table
CREATE TABLE products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR(50),
  stock INT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles Table
CREATE TABLE articles (
  article_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100),
  category VARCHAR(50),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT,
  member_id INT NOT NULL,
  therapist_id INT,
  rating INT (1-5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id),
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id)
);

-- Medical Records Table
CREATE TABLE medical_records (
  record_id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- AI Analysis Results Table
CREATE TABLE ai_analysis_results (
  analysis_id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  image_path VARCHAR(255),
  skin_type VARCHAR(50),
  detected_conditions JSON,
  confidence_score DECIMAL(5, 2),
  heatmap_image VARCHAR(255),
  recommendations JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- Appointment Reminders Table
CREATE TABLE appointment_reminders (
  reminder_id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  member_email VARCHAR(100),
  reminder_time DATETIME,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);

-- Page Info Table
CREATE TABLE page_info (
  info_id INT PRIMARY KEY AUTO_INCREMENT,
  page_name VARCHAR(50), -- 'about', 'services', 'footer'
  content LONGTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📦 Setup & Instalasi

### **Prerequisites**

```
✓ Node.js v16+ 
✓ npm atau yarn
✓ MySQL 8.0+
✓ Python 3.8+ (untuk AI Skin Analysis)
✓ Git
✓ Docker & Docker Compose (untuk production)
```

### **1. Clone Repository**

```bash
git clone <repository-url>
cd mochintbeauty-app
```

### **2. Backend Setup**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env
nano .env
# Set:
# DATABASE_URL=mysql://root:password@localhost:3306/beauty_clinic
# PORT=5000
# JWT_SECRET=your_secret_key
# GOOGLE_CLIENT_ID=your_google_id
# GOOGLE_CLIENT_SECRET=your_secret
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=app_password
# NODE_ENV=development

# Initialize database
npm run init-db

# Start backend (development)
npm run dev
```

### **3. Frontend Setup**

```bash
# Navigate to root directory (if not already there)
cd ..

# Install dependencies
npm install

# Create .env file
nano .env.local
# Set:
# VITE_API_URL=http://localhost:5000/api

# Start frontend (development)
npm run dev
# Access at http://localhost:5173
```

### **4. Python ML Server Setup (Optional)**

```bash
# Create Python virtual environment
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start Python server
python app.py
# Runs on http://localhost:5000 (different port)
```

### **5. Docker Setup (Production)**

```bash
# Build and run with Docker Compose
docker-compose up -d

# Services will be available:
# - App: http://localhost
# - phpMyAdmin: http://localhost:8081
# - Database: localhost:3306

# Stop containers
docker-compose down

# View logs
docker-compose logs -f app
```

---

## 🚀 Menjalankan Aplikasi

### **Development Mode**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App running on http://localhost:5173
```

**Terminal 3 - Python ML (Optional):**
```bash
cd python-ml
source venv/bin/activate
python app.py
```

### **Production Mode**

```bash
# Build frontend
npm run build

# Start backend with PM2 (process manager)
npm install -g pm2
cd server
pm2 start server.js --name "mochint-backend"

# Or use Docker
docker-compose up -d
```

### **Database Initialization**

```bash
# Navigate to server folder
cd server

# Run initialization (creates all tables)
npm run init-db

# Or manually run migration
npm run migrate
```

---

## 📡 API Endpoints

### **Authentication Endpoints**

```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login with email & password
GET    /api/auth/google             - Google OAuth login
GET    /api/auth/google/callback    - Google OAuth callback
POST   /api/auth/send-otp           - Send OTP email
POST   /api/auth/verify-otp         - Verify OTP
POST   /api/auth/set-password       - Set password (for OAuth users)
POST   /api/auth/forgot-password    - Reset forgotten password
```

### **Member Endpoints**

```
GET    /api/members                  - Get all members (admin only)
GET    /api/members/:id              - Get member profile
POST   /api/members                  - Create new member
PUT    /api/members/:id              - Update member profile
DELETE /api/members/:id              - Delete member (admin only)
```

### **Appointment Endpoints**

```
GET    /api/appointments             - Get appointments (filtered by role)
GET    /api/appointments/:id         - Get appointment detail
POST   /api/appointments             - Create new appointment
PUT    /api/appointments/:id         - Update appointment status
DELETE /api/appointments/:id         - Cancel appointment
GET    /api/appointments/member/:id  - Get member's appointments
```

### **Treatment Endpoints**

```
GET    /api/treatments               - Get all treatments
GET    /api/treatments/:id           - Get treatment detail
POST   /api/treatments               - Create treatment (admin)
PUT    /api/treatments/:id           - Update treatment (admin)
DELETE /api/treatments/:id           - Delete treatment (admin)
GET    /api/treatments/:id/options   - Get treatment options
```

### **Therapist Endpoints**

```
GET    /api/therapists               - Get all therapists
GET    /api/therapists/:id           - Get therapist detail
POST   /api/therapists               - Create therapist (admin)
PUT    /api/therapists/:id           - Update therapist (admin)
DELETE /api/therapists/:id           - Delete therapist (admin)
GET    /api/therapists/:id/schedule  - Get therapist schedule
```

### **Product Endpoints**

```
GET    /api/products                 - Get all products
GET    /api/products/:id             - Get product detail
POST   /api/products                 - Create product (admin)
PUT    /api/products/:id             - Update product (admin)
DELETE /api/products/:id             - Delete product (admin)
```

### **Review Endpoints**

```
GET    /api/reviews                  - Get all reviews
POST   /api/reviews                  - Create review
PUT    /api/reviews/:id              - Update review
DELETE /api/reviews/:id              - Delete review
GET    /api/reviews/therapist/:id    - Get therapist reviews
```

### **Article Endpoints**

```
GET    /api/articles                 - Get all articles
GET    /api/articles/:id             - Get article detail
POST   /api/articles                 - Create article (admin)
PUT    /api/articles/:id             - Update article (admin)
DELETE /api/articles/:id             - Delete article (admin)
```

### **AI Skin Analysis Endpoints**

```
POST   /api/ai-skin-analysis/analyze - Analyze skin from image
GET    /api/ai-skin-analysis/:id     - Get analysis result
GET    /api/ai-skin-analysis/member/:id - Get member's analyses
```

### **Contact & Page Info Endpoints**

```
POST   /api/contact                  - Submit contact form
GET    /api/page-info                - Get page info
PUT    /api/page-info/:type          - Update page info (admin)
```

---

## 🔐 Authentication & Security

### **JWT Token Flow**

1. **Login** → Backend generates JWT with:
   - user_id
   - role (admin, member)
   - email
   - Expiry: 24 hours

2. **Storage** → Frontend stores in `localStorage`:
   ```javascript
   localStorage.setItem('token', jwtToken);
   localStorage.setItem('user', JSON.stringify(userData));
   ```

3. **Usage** → Frontend sends with every request:
   ```javascript
   Authorization: Bearer <token>
   ```

4. **Validation** → Backend middleware validates:
   - Token exists
   - Token not expired
   - Token signature valid
   - User still exists in database

### **Password Security**

- Passwords hashed with **bcrypt** (10 rounds)
- Never stored in plain text
- Compared safely on login

### **Role-Based Access Control (RBAC)**

```
Routes Protected by:
├─ /admin/*          → role === 'admin'
├─ /member/*         → role === 'member'
└─ /public/*         → No auth required (public)
```

---

## 📊 Monitoring & Logging

### **Request Logging**
- Every request logged with timestamp
- Method, URL, and response time tracked
- Errors logged with full stack trace

### **Email Logs**
- All sent emails tracked in database
- Timestamp, recipient, status stored
- Failed emails can be retried

### **API Documentation**
- Swagger UI available at `/api-docs`
- Interactive API testing
- Full endpoint documentation

---

## 🐛 Troubleshooting

### **Database Connection Error**

```
Error: connect ECONNREFUSED 127.0.0.1:3306

Solution:
1. Check MySQL is running: sudo service mysql status
2. Verify DATABASE_URL in .env
3. Ensure database exists: CREATE DATABASE beauty_clinic
```

### **Port Already in Use**

```
Error: EADDRINUSE: address already in use :::5000

Solution:
# Kill process using port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### **JWT Token Expired**

```
Error: 401 Unauthorized - Token expired

Solution:
1. User needs to login again
2. Frontend clears localStorage
3. Redirect to /login page
```

### **File Upload Fails**

```
Error: File too large or invalid type

Solution:
1. Check file size (max 50MB)
2. Ensure image file type (jpg, png, webp)
3. Check /public/uploads permissions
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push branch: `git push origin feature/your-feature`
4. Open Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues and questions:
- Create GitHub Issue
- Contact: mochintclinic@gmail.com
- Check Swagger API Docs: `/api-docs`

---

## 🎉 Kesimpulan

**Mochint Beauty Care** adalah aplikasi web full-stack modern yang menggabungkan:
- ✅ **Frontend Modern**: React + Vite + Tailwind CSS
- ✅ **Backend Robust**: Express.js + MySQL + JWT Auth
- ✅ **AI Integration**: PyTorch untuk analisis kulit
- ✅ **Cloud Ready**: Docker containerization
- ✅ **Scalable Architecture**: REST API dengan middleware patterns

Sistem dirancang untuk mudah dikembangkan, dimaintain, dan discale sesuai pertumbuhan bisnis.

---

**Last Updated:** May 29, 2026  
**Version:** 1.0.0  
**Author:** Mochint Beauty Team
