# 🌐 Rekomendasi Hosting untuk Mochint Beauty Care

## 📊 Analisis & Estimasi Biaya Hosting

---

## 🎯 Opsi 1: TANPA AI Skin Analysis (Lebih Terjangkau)

### **A. Budget Hosting - All-in-One (Paling Murah)**

#### **1. Hostinger VPS + Managed MySQL**
**Platform:** Hostinger (Indonesia-friendly)

```
Spesifikasi VPS:
├─ CPU: 2 Core
├─ RAM: 4 GB
├─ Storage: 100 GB SSD
├─ Bandwidth: Unlimited
├─ OS: Ubuntu/CentOS
└─ Support: 24/7

Termasuk:
✓ MariaDB/MySQL managed
✓ Node.js support
✓ SSL certificate (gratis)
✓ Daily backups
✓ Control panel (cPanel/Plesk)
```

**Estimasi Biaya:**
```
VPS Hosting:        Rp 159.000/bulan (promo tahunan ~Rp 95.000/bulan)
Domain .com:        Rp 30.000/bulan (tahunan)
Email hosting:      Included
SSL Certificate:    Included (Let's Encrypt)
Backup premium:     Rp 50.000/bulan (optional)
─────────────────────────────────────
TOTAL/BULAN:        ~Rp 159.000 - 239.000
TOTAL/TAHUN:        ~Rp 1.908.000 - 2.868.000
```

**Pros:**
- ✅ Sangat terjangkau
- ✅ Cukup untuk traffic medium (~10K - 50K visits/bulan)
- ✅ Full control via SSH
- ✅ Cocok untuk development & small production

**Cons:**
- ❌ Perlu maintain sendiri (update, security patches)
- ❌ Setup membutuhkan technical knowledge
- ❌ Downtime jika ada issue

---

#### **2. Railway.app (Recommended untuk Pemula)**
**Platform:** Railway (Cloud-native, Indonesia bisa)

```
Spesifikasi:
├─ Backend Node.js (Container)
├─ MySQL Database (Managed)
├─ Storage: 10 GB
├─ Bandwidth: Unlimited
├─ Auto-scaling: Yes
└─ Monitoring: Built-in

Services:
✓ Express.js server
✓ MySQL database
✓ Environment variables
✓ Auto deployment (dari GitHub)
✓ SSL included
```

**Estimasi Biaya:**
```
Pay-as-you-go (metered):
├─ Compute: $5-10/bulan (minimal)
├─ Database: $5-10/bulan (minimal)
├─ Storage: Included (10 GB free)
├─ Network: $0.09 per GB
└─ Free tier: $5/bulan credit

OR

Railway Starter Plan:
├─ Monthly allocation: $5
├─ Database: Included
├─ Compute: Included
└─ Best for: Development/Small apps

Konversi:
────────────────────────────────────
BASIC PLAN:         ~$10/bulan
GROWTH:             ~$30/bulan
PRODUCTION:         ~$50-100/bulan
───────────────────────────────────
DALAM RUPIAH (1 USD = Rp 15.000):
────────────────────────────────────
BASIC PLAN:         ~Rp 150.000/bulan
GROWTH:             ~Rp 450.000/bulan
PRODUCTION:         ~Rp 750.000 - 1.5jt/bulan
```

**Pros:**
- ✅ Minimal setup (push ke GitHub = deploy)
- ✅ Auto-scaling otomatis
- ✅ MySQL managed (automatic backups)
- ✅ Environment variable management
- ✅ Great for startups

**Cons:**
- ❌ Biaya bisa membengkak jika traffic tinggi
- ❌ Storage limited
- ❌ Compute bisa bottleneck jika traffic spike

---

#### **3. Vercel + Supabase (Best for Scalability)**
**Platform:** Vercel (Frontend) + Supabase (Backend & DB)

```
Vercel (Frontend - React):
├─ Auto-scaling
├─ CDN global
├─ Bandwidth: 100 GB/bulan free tier
├─ Deployment: GitHub integration
└─ SSL: Included

Supabase (Backend + PostgreSQL):
├─ Managed PostgreSQL
├─ Auto API generation
├─ Real-time subscriptions
├─ Auth built-in
├─ Storage: 1 GB free
└─ Database: 500 MB free tier
```

**Estimasi Biaya:**
```
Vercel Frontend:
├─ Pro Plan: $20/bulan
├─ Bandwidth: 1000 GB included
└─ Best for: High-traffic static/SSR

Supabase Backend:
├─ Pro Plan: $25/bulan
├─ Database: 8 GB
├─ Bandwidth: 250 GB
├─ Auth: Unlimited users
└─ API calls: Unlimited

Custom Domain:
├─ Domain registrar: Rp 30.000/bulan
└─ Email MX records: Free

────────────────────────────────
VERCEL PRO:         $20/bulan
SUPABASE PRO:       $25/bulan
Domain .com:        Rp 30.000 (~$2)
────────────────────────────────
TOTAL/BULAN:        ~$47 = Rp 705.000
TOTAL/TAHUN:        ~$564 = Rp 8.460.000
```

**Pros:**
- ✅ Sangat scalable
- ✅ Borderless deployment
- ✅ Great uptime (99.99%)
- ✅ Auto-backup included
- ✅ Mudah maintenance
- ✅ PostgreSQL lebih powerful dari MySQL

**Cons:**
- ❌ Node.js backend perlu dibuat sebagai API functions
- ❌ Biaya bisa naik dengan traffic
- ❌ Database limited 8 GB (perlu upgrade)

---

### **B. Mid-Range Hosting (Balanced)**

#### **4. Digital Ocean + Managed Services**
**Platform:** Digital Ocean (Indonesia-friendly, lokal)

```
Spesifikasi Droplet:
├─ CPU: 2 vCPU
├─ RAM: 4 GB
├─ Storage: 80 GB SSD
├─ Bandwidth: 4 TB/bulan
├─ Monitoring: Built-in
└─ Backups: Daily

Managed Services:
├─ Managed MySQL: $15/bulan
├─ App Platform: $12/bulan
└─ Redis Cache: $15/bulan (optional)
```

**Estimasi Biaya:**
```
Droplet (Basic):            $6/bulan
Managed MySQL:              $15/bulan
Backups:                    Free
SSL Certificate:            Free
Monitoring:                 Free
Registry (Docker images):   Free
────────────────────────────────
TOTAL/BULAN:                $21 = Rp 315.000
ATAU dengan App Platform:   $24-30/bulan
────────────────────────────────
TOTAL/TAHUN:                ~Rp 3.780.000 - 4.500.000
```

**Pros:**
- ✅ Cukup powerful untuk traffic medium-high
- ✅ Managed database (backup otomatis)
- ✅ Dokumentasi lengkap
- ✅ Support responsive
- ✅ Pricing transparan

**Cons:**
- ❌ Perlu setup sendiri (Linux knowledge)
- ❌ Scaling manual

---

### **C. Premium Hosting (Komplit & Reliable)**

#### **5. AWS (Recommended untuk Production)**
**Platform:** Amazon Web Services

```
Spesifikasi:
├─ EC2 Instance: t3.medium
│  ├─ CPU: 2 vCPU
│  ├─ RAM: 4 GB
│  ├─ Storage: 100 GB EBS
│  └─ Bandwidth: 100 GB free/bulan
│
├─ RDS MySQL:
│  ├─ db.t3.micro (free tier 12 bulan)
│  ├─ Storage: 20 GB
│  ├─ Multi-AZ: Optional
│  └─ Backup: 7 days
│
├─ S3 Storage: Rp 1.000/GB
├─ CloudFront CDN: Rp 3.000/GB
└─ Route 53 DNS: Rp 430/bulan
```

**Estimasi Biaya:**
```
EC2 (t3.medium):            $30-40/bulan
RDS MySQL (db.t3.small):    $30-50/bulan
S3 Storage (50 GB):         $1-2/bulan
CloudFront (500 GB):        $50-100/bulan
Backup & Snapshots:         $10-20/bulan
────────────────────────────────
TOTAL/BULAN:                $120-210 = Rp 1.8jt - 3.15jt
────────────────────────────────
TOTAL/TAHUN:                ~Rp 21.6jt - 37.8jt
```

**Pros:**
- ✅ Enterprise-grade reliability
- ✅ 99.99% uptime SLA
- ✅ Auto-scaling & Load balancing
- ✅ Global CDN included
- ✅ Security & compliance (GDPR, ISO)
- ✅ Free tier available (12 bulan)

**Cons:**
- ❌ Paling mahal
- ❌ Learning curve steep
- ❌ Billing bisa kompleks

---

## 🤖 Opsi 2: DENGAN AI Skin Analysis (Biaya Lebih Tinggi)

### **Requirements Tambahan untuk AI:**
```
✓ GPU server (untuk inference cepat)
✓ Python runtime environment
✓ PyTorch libraries (heavy ~2-3 GB)
✓ Model storage (mochint_model.pth)
✓ More compute power
✓ More RAM (minimum 8GB)
```

---

### **A. Budget Hosting dengan AI (Terjangkau)**

#### **1. Railway.app dengan Python Container**
**Setup:** 2 containers (Node.js + Python)

```
Architecture:
┌─────────────────────────────┐
│   Frontend (Vercel)         │
└──────────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │  Backend (Railway)      │
    │  Node.js Container      │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────────┐
    │  AI Server (Railway)    │
    │  Python Container       │
    │  PyTorch model          │
    └─────────────────────────┘
           │
    ┌──────▼──────────────────┐
    │  MySQL Database         │
    │  (Managed)              │
    └─────────────────────────┘
```

**Estimasi Biaya:**
```
Vercel Frontend:            $20/bulan
Railway Backend (Node.js):  $15-20/bulan
Railway AI Server (Python): $25-40/bulan
  └─ GPU compute addon:     +$10-20
MySQL Database:             $10/bulan
Domain:                     Rp 30.000/bulan
────────────────────────────────
TOTAL/BULAN:                $80-110 = Rp 1.2jt - 1.65jt
────────────────────────────────
TOTAL/TAHUN:                ~Rp 14.4jt - 19.8jt
```

**Pros:**
- ✅ Masih terjangkau
- ✅ Auto-scaling untuk AI requests
- ✅ Mudah di-maintain

**Cons:**
- ❌ GPU compute addon mahal
- ❌ Cold start latency pada AI requests

---

#### **2. Google Cloud Platform (GCP) dengan AI**
**Setup:** Lebih optimal untuk ML

```
Services:
├─ App Engine (Node.js Backend):     $0-50/bulan
├─ Cloud Run (Python AI Service):    $0-40/bulan
├─ Cloud SQL (MySQL):                $20-30/bulan
├─ Cloud Storage (Model + uploads):  $1-5/bulan
├─ Cloud CDN:                        $0.025/GB
└─ Always Free tier:                 $300/bulan credit

AI-Specific:
├─ AI Platform Prediction:           $0.10 per 1K requests
├─ Or: Self-hosted with GPU:         $50-100/bulan
└─ Model serving: Included in Cloud Run
```

**Estimasi Biaya:**
```
App Engine (Node.js):       $15-25/bulan
Cloud Run (Python):         $20-35/bulan
Cloud SQL (MySQL):          $25-35/bulan
Cloud Storage:              $2-5/bulan
Backup & egress:            $5-10/bulan
────────────────────────────────
TOTAL/BULAN:                $60-100 = Rp 900.000 - 1.5jt
MINUS AI Platform Credit:   -$300 (free tier)
────────────────────────────────
ACTUAL (First 6 months):    ~FREE / Very Cheap
AFTER FREE TIER:            ~Rp 900jt - 1.5jt
────────────────────────────────
TOTAL/TAHUN:                ~Rp 10.8jt - 18jt
```

**Pros:**
- ✅ Free tier sangat generous ($300/bulan)
- ✅ Optimal untuk ML workloads
- ✅ Auto-scaling untuk AI inference
- ✅ Pay-per-request pricing (efficient)
- ✅ Bisa gratis untuk 6 bulan pertama!

**Cons:**
- ❌ Setup lebih kompleks
- ❌ Learning curve

---

#### **3. Heroku (Legacy tapi Reliable)**
**PERHATIAN: Heroku shutdown free tier Nov 2022, tapi dyno berbayar masih ada**

```
Spesifikasi:
├─ Backend Dyno (Standard-1X): $50/bulan
├─ Worker Dyno untuk AI:       $50/bulan
├─ PostgreSQL Database:        $50-100/bulan
└─ Addons & extras:            $10-20/bulan
```

**Estimasi Biaya:**
```
Backend Dyno:               $50/bulan
Worker/AI Dyno:             $50/bulan
PostgreSQL Database:        $50/bulan
Add-ons:                    $10-20/bulan
────────────────────────────────
TOTAL/BULAN:                $160-170 = Rp 2.4jt - 2.55jt
────────────────────────────────
TOTAL/TAHUN:                ~Rp 28.8jt - 30.6jt
```

**Pros:**
- ✅ Deploy super mudah (git push)
- ✅ Reliable & trusted

**Cons:**
- ❌ Paling mahal dibanding competitors
- ❌ Tidak recommended untuk budget startup

---

### **B. Enterprise AI Hosting**

#### **4. AWS dengan AI Services**
**Setup:** Lengkap dengan GPU & managed services

```
Services:
├─ EC2 (GPU Instance - g4dn.xlarge):
│  ├─ CPU: 4 vCPU
│  ├─ RAM: 16 GB
│  ├─ GPU: 1x NVIDIA T4
│  └─ Storage: 125 GB
│
├─ RDS MySQL:                Managed
├─ S3 (Model + uploads):     Scalable
├─ SageMaker:                $0.126/hour untuk inference
├─ Lambda:                   Pay-per-invocation
└─ CloudFront CDN:           Global distribution
```

**Estimasi Biaya:**
```
EC2 GPU Instance:           $150-200/bulan
RDS MySQL (db.t3.medium):   $50-70/bulan
S3 Storage (500GB):         $10-15/bulan
SageMaker Endpoints:         $50-100/bulan (OR)
Lambda + GPU:               $20-50/bulan
CloudFront:                 $20-50/bulan
────────────────────────────────
TOTAL/BULAN:                $300-500 = Rp 4.5jt - 7.5jt
────────────────────────────────
TOTAL/TAHUN:                ~Rp 54jt - 90jt
```

**Pros:**
- ✅ Powerful GPU untuk real-time AI
- ✅ Paling scalable
- ✅ Enterprise-grade security
- ✅ Global infrastructure

**Cons:**
- ❌ Sangat mahal untuk startup
- ❌ Over-engineering untuk sekarang

---

## 📋 Perbandingan & Rekomendasi

### **Tabel Perbandingan Lengkap**

| Opsi | Tanpa AI | Dengan AI | Skalabilitas | Ease of Setup | Recommended |
|------|----------|-----------|--------------|---------------|-------------|
| **Hostinger VPS** | Rp 159K | Rp 259K | ⭐⭐⭐ | ⭐⭐ | 🟡 |
| **Railway.app** | Rp 150K | Rp 1.2jt | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🟢 |
| **Vercel + Supabase** | Rp 705K | Rp 900K | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🟢 |
| **Digital Ocean** | Rp 315K | Rp 700K | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🟡 |
| **AWS** | Rp 1.8jt | Rp 4.5jt | ⭐⭐⭐⭐⭐ | ⭐⭐ | 🔴 |
| **GCP** | Rp 1.5jt | Rp 900K* | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 🟢 |
| **Heroku** | - | Rp 2.4jt | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🔴 |

*GCP dapat $300 free tier per bulan

---

## 🎯 REKOMENDASI TERBAIK BERDASARKAN STAGE

### **Stage 1: Development/MVP (Bulan 1-3)**
```
✅ BEST: Railway.app
├─ Biaya: Rp 150-250K/bulan
├─ Setup: Super cepat (push ke GitHub)
├─ Scale: Bisa handle 10-50K users
└─ Benefit: Focus pada product, bukan infrastructure

ATAU

✅ GCP (dengan free tier)
├─ Biaya: FREE untuk 6 bulan ($300 credit/bulan)
├─ Setup: Agak kompleks tapi powerful
└─ Benefit: Bisa siap untuk scale + AI

JANGAN:
❌ AWS (terlalu kompleks untuk MVP)
❌ Heroku (terlalu mahal)
```

### **Stage 2: Growth (Bulan 3-12, traffic meningkat)**
```
✅ BEST: Vercel + Supabase
├─ Biaya: Rp 700K/bulan (stable)
├─ Scale: 100K+ users bisa
├─ Maintained: Tidak perlu maintenance
└─ Benefit: Focus pada business growth

DENGAN AI:
✅ Railway.app + Python Container
├─ Biaya: Rp 1.2-1.65jt/bulan
├─ AI: Real-time analysis bisa
└─ Scale: Medium traffic OK

ALTERNATIVE:
✅ Digital Ocean
├─ Biaya: Rp 700K/bulan
├─ AI: Bisa tapi setup lebih complex
└─ Scale: Good untuk 100K users
```

### **Stage 3: Scale/Production (1+ tahun, enterprise)**
```
✅ BEST: AWS atau GCP
├─ Biaya: Rp 4.5jt - 10jt/bulan
├─ Scale: Unlimited
├─ Reliability: 99.99% uptime SLA
└─ Benefit: Enterprise-ready

DENGAN AI:
✅ GCP (lebih optimal untuk ML)
├─ Biaya: Rp 3-5jt/bulan
├─ AI: Built-in ML services
└─ Scale: Real-time inference bisa

ATAU

✅ AWS (mais flexible)
├─ Biaya: Rp 4.5-7.5jt/bulan
├─ AI: SageMaker untuk advanced features
└─ Scale: Unlimited everything
```

---

## 💡 MY TOP PICK (Rekomendasi Pribadi)

### **UNTUK SEKARANG (MVP/Early Stage):**

#### **🥇 RANKING 1: Railway.app**
```
PROS:
✓ Harga super terjangkau: Rp 150K-250K/bulan
✓ Deploy sangat mudah: git push = live
✓ Tidak perlu manage server
✓ Auto-scaling included
✓ Bisa add AI container nanti
✓ Support yang responsive

CONS:
✗ Compute bisa terbatas saat peak traffic
✗ Kurang control daripada self-hosted

COCOK UNTUK:
✓ Startup baru
✓ MVP dengan budget terbatas
✓ Team yang kecil (1-3 orang)
✓ Focus pada product, bukan infrastructure

ROADMAP:
Bulan 1-3:   Railway (Rp 150K)
Bulan 3-6:   Railway + Python AI (Rp 1.2jt)
Bulan 6+:    Migrate ke GCP / AWS (if needed)
```

#### **🥈 RANKING 2: GCP (dengan free tier)**
```
PROS:
✓ Free tier sangat generous ($300/bulan)
✓ GRATIS untuk 6 bulan pertama!!
✓ Perfect untuk AI/ML workloads
✓ Pay-per-request pricing (cost-efficient)
✓ Auto-scaling built-in
✓ Global CDN included

CONS:
✗ Setup lebih kompleks
✗ Perlu belajar GCP ecosystem
✗ After free tier: Rp 1.5jt/bulan

COCOK UNTUK:
✓ Startup dengan technical team
✓ Yang ingin gratusan 6 bulan
✓ Plan untuk scale dengan AI
✓ Need global infrastructure

ROADMAP:
Bulan 1-6:   GCP Free Tier = Rp 0 (but setup proper)
Bulan 6+:    GCP Paid = Rp 1.5jt/bulan
Tahun 2+:    AWS atau tetap GCP (depends on needs)
```

#### **🥉 RANKING 3: Vercel + Supabase**
```
PROS:
✓ Best untuk frontend performance
✓ Global CDN otomatis
✓ Database management lebih mudah
✓ Harga stable: Rp 700K/bulan
✓ Scaling bisa automatically
✓ Great for React apps

CONS:
✗ PostgreSQL (bukan MySQL)
✗ Perlu refactor backend
✗ Database limited 8GB
✗ Biaya bisa naik jika traffic tinggi

COCOK UNTUK:
✓ Jika mau fastest frontend
✓ Traffic yang predictable
✓ Small-medium businesses
✓ Tidak perlu heavy AI processing

ROADMAP:
Bulan 1+:    Vercel + Supabase = Rp 700K
Tahun 1:     Migrate to PostgreSQL (simple)
Tahun 2+:    Tetap Vercel atau upgrade
```

---

## 📊 BREAKDOWN BIAYA TAHUNAN (RINGKAS)

### **Opsi Tanpa AI:**
```
Railway:            Rp 1.8jt - 3jt/tahun
Vercel + Supabase:  Rp 8.4jt/tahun
Digital Ocean:      Rp 3.8jt/tahun
Hostinger VPS:      Rp 1.9jt/tahun
AWS:                Rp 21.6jt/tahun
```

### **Opsi Dengan AI:**
```
Railway + Python:       Rp 14.4jt - 19.8jt/tahun
GCP (free 6mo):         Rp 0 (6mo) + Rp 10.8jt (6mo) = Rp 10.8jt
Google Cloud:           Rp 10.8jt - 18jt/tahun
AWS + GPU:              Rp 54jt - 90jt/tahun
Heroku:                 Rp 28.8jt - 30.6jt/tahun
```

---

## 🚀 STEP-BY-STEP SETUP PLAN

### **Scenario: Pakai Railway.app (Recommended)**

```
WEEK 1:
□ Sign up railway.app
□ Connect GitHub repository
□ Setup environment variables
□ Deploy backend & database
□ Test API endpoints
  Biaya: Rp 0 (trial period)

WEEK 2:
□ Deploy frontend ke Railway
□ Setup custom domain
□ Configure SSL certificate
□ Optimize performance
  Biaya: Mulai Rp 150K-200K/bulan

MONTH 2:
□ Monitor traffic & performance
□ Setup backup strategy
□ Implement CI/CD pipeline
□ Optimize database queries
  Biaya: Rp 200-250K/bulan

MONTH 3:
□ If traffic growing → Consider scaling
□ If want AI → Add Python container
□ Evaluate apakah perlu migrate
  Biaya: Rp 250K - 1.2jt/bulan (jika ada AI)

MONTH 6:
□ Analyze growth metrics
□ Decide: Stay di Railway atau migrate?
□ If migrate → Choose GCP/AWS
  Biaya: ~Rp 1.5jt - 4.5jt/bulan
```

---

## ⚠️ CATATAN PENTING

### **Hal-hal yang harus dipertimbangkan:**

1. **Traffic Estimation:**
   ```
   - 100 users/hari       → Railway cukup
   - 1000 users/hari      → Railway masih OK
   - 10K users/hari       → Mulai pertimbang scale
   - 100K+ users/hari     → Perlu AWS/GCP
   ```

2. **Data Sensitivity:**
   ```
   - Medical data → Butuh compliance (GDPR/local)
   - Need: Backup redundancy, encryption
   - Recommendation: AWS atau GCP (more compliant)
   ```

3. **AI Model Size:**
   ```
   - mochint_model.pth size: ~100-500MB
   - Need: Enough storage + RAM untuk load
   - Railway: Cukup tapi tight
   - GCP: Perfect, banyak storage
   ```

4. **Concurrent Users:**
   ```
   - < 100 concurrent  → Hostinger atau Railway
   - 100-500          → Railway atau Digital Ocean
   - 500-5000         → Vercel + Supabase
   - 5000+            → AWS atau GCP
   ```

5. **Geographic Distribution:**
   ```
   - Indonesia only    → Railway atau Hostinger
   - Southeast Asia    → GCP atau AWS (regional)
   - Global            → AWS atau Cloudflare
   ```

---

## 🎬 ACTION ITEMS

### **Immediate (This Week):**
- [ ] Sign up di Railway.app (free trial)
- [ ] Push repository & test deployment
- [ ] Estimate expected traffic & users
- [ ] Check current database size

### **Short Term (This Month):**
- [ ] Decide: Railway atau GCP?
- [ ] Setup monitoring & alerting
- [ ] Create backup strategy
- [ ] Plan for AI implementation

### **Medium Term (3-6 months):**
- [ ] Evaluate performance vs cost
- [ ] Consider migration if needed
- [ ] Implement caching strategies
- [ ] Optimize database queries

---

## 📞 SUPPORT & RESOURCES

### **Untuk setiap platform:**

**Railway.app:**
- Docs: https://docs.railway.app
- Discord: Community support
- Email: support@railway.app

**GCP:**
- Docs: https://cloud.google.com/docs
- Console: https://console.cloud.google.com
- Support: Professional support available

**Vercel + Supabase:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Community: Discord channels

**AWS:**
- Docs: https://docs.aws.amazon.com
- AWS Support: Berbagai tier
- Academy: Training programs

---

## 📝 KESIMPULAN

| Kebutuhan | Rekomendasi | Biaya |
|-----------|------------|-------|
| **MVP Cepat** | Railway.app | Rp 150K-250K/bulan |
| **MVP + Free Tier** | GCP | Rp 0 (6 bulan pertama) |
| **Growth Stage** | Vercel + Supabase | Rp 700K/bulan |
| **Enterprise** | AWS atau GCP | Rp 3-10jt/bulan |
| **Dengan AI** | Railway + Python | Rp 1.2-1.65jt/bulan |

**FINAL RECOMMENDATION: Mulai dengan Railway.app, scale ke GCP jika traffic naik, explore AWS untuk enterprise features.**

---

Last Updated: May 31, 2026  
Version: 1.0.0
