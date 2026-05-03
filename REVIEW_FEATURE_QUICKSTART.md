# Quick Start: Admin Review Management Feature

## 🚀 Instalasi Cepat (5 menit)

### Step 1: Database Setup
```bash
cd server
node setup_review_feature.js
```

Output expected:
```
✅ Added column: adminId
✅ Added column: adminReply
✅ Added column: repliedAt
✅ Added column: isFeatured
✅ Added column: isApproved
✅ Added foreign key: adminId -> admin_users(id)
```

### Step 2: Verify Backend Services Running
Pastikan di `server.js` sudah include routes review:

```javascript
const reviewsRoutes = require('./routes/reviewsRoutes');
app.use('/api/reviews', reviewsRoutes);
```

### Step 3: Add Admin Menu Item
Edit file admin navbar/menu untuk menambahkan link ke ReviewManagement page:

```jsx
import { Link } from 'react-router-dom';

<Link to="/admin/reviews" className="menu-item">
  📝 Review Management
</Link>
```

### Step 4: Add Route di Admin Routes
```jsx
import ReviewManagement from '../pages/admin/ReviewManagement';

<Route path="/admin/reviews" element={<ReviewManagement />} />
```

### Step 5: Test Feature
1. **Member membuat review:**
   - Buka halaman My Review
   - Submit rating + komentar
   
2. **Admin lihat & manage:**
   - Buka Admin > Review Management
   - Lihat semua reviews
   - Test: Reply, Featured, Approve/Reject

3. **Customer lihat balasan:**
   - Buka halaman My Review
   - Lihat "Your Reviews" section
   - Admin reply tampil di bawah review

## 📱 Integrasi Homepage (Optional)

Untuk menampilkan featured reviews di homepage:

```jsx
// pages/Home.jsx
import { getFeaturedReviews } from '../api/client';

export default function Home() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    getFeaturedReviews().then(data => {
      setReviews(data.data || []);
    });
  }, []);

  return (
    <section className="testimonials">
      <h2>⭐ Featured Reviews</h2>
      <div className="reviews-grid">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <h4>{review.name}</h4>
      <p className="rating">{'⭐'.repeat(review.rating)}</p>
      <p className="comment">{review.comment}</p>
      {review.adminReply && (
        <div className="admin-reply">
          <strong>Admin:</strong>
          <p>{review.adminReply}</p>
        </div>
      )}
    </div>
  );
}
```

## 🧪 Testing API Endpoints

### 1. Create Review (User)
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 260021,
    "rating": 5,
    "comment": "Pelayanan bagus!"
  }'
```

### 2. Get All Reviews (Admin)
```bash
curl http://localhost:5000/api/reviews
```

### 3. Get Featured Reviews (Homepage)
```bash
curl http://localhost:5000/api/reviews/featured
```

### 4. Admin Add Reply
```bash
curl -X POST http://localhost:5000/api/reviews/1/admin-reply \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": 2,
    "adminReply": "Terima kasih atas review Anda!"
  }'
```

### 5. Toggle Featured
```bash
curl -X PUT http://localhost:5000/api/reviews/1/featured \
  -H "Content-Type: application/json" \
  -d '{"isFeatured": true}'
```

### 6. Toggle Approval
```bash
curl -X PUT http://localhost:5000/api/reviews/1/approved \
  -H "Content-Type: application/json" \
  -d '{"isApproved": false}'
```

## 📂 File Struktur

```
mochintbeauty-app/
├── server/
│   ├── models/Reviews.js (✅ UPDATED - new methods)
│   ├── controllers/reviewsController.js (✅ UPDATED - new endpoints)
│   ├── routes/reviewsRoutes.js (✅ UPDATED - new routes)
│   ├── add_admin_reply_to_reviews.sql (NEW)
│   ├── add_admin_reply_to_reviews.js (NEW)
│   └── setup_review_feature.js (NEW - recommended)
│
├── src/
│   ├── api/client.js (✅ UPDATED - new exports)
│   ├── pages/admin/ReviewManagement.jsx (NEW)
│   ├── pages/member/Review.jsx (✅ UPDATED - show admin replies)
│
└── ADMIN_REVIEW_MANAGEMENT.md (NEW - full documentation)
```

## 🔄 API Methods (Frontend)

Semua methods sudah tersedia di `src/api/client.js`:

```javascript
import {
  getReviews,              // Get all reviews
  getFeaturedReviews,      // Get featured only
  postReview,              // Create review
  updateReview,            // Edit review (user)
  addAdminReply,           // Admin reply
  toggleFeatured,          // Toggle featured
  toggleApproved,          // Toggle approval
  deleteReview             // Delete review
} from '../../api/client';
```

## ⚙️ Admin Panel Features

**ReviewManagement.jsx** includes:

| Feature | Icon | Function |
|---------|------|----------|
| List All Reviews | 📋 | See all customer reviews |
| Filter | 🔍 | Filter by: All, Pending Reply, Featured |
| Rating Display | ⭐ | Show 1-5 stars |
| Add Reply | 💬 | Admin responds to review |
| Toggle Featured | ⭐ | Add/remove from homepage |
| Toggle Approval | ✓/✗ | Approve/reject review |
| Delete | 🗑️ | Delete review |

## 🎯 Key Features Summary

### User Side
- ✅ Create review dengan rating 1-5 dan komentar
- ✅ Lihat review sendiri
- ✅ Lihat balasan admin untuk setiap review
- ✅ Edit review (rating & komentar)

### Admin Side
- ✅ Lihat semua reviews
- ✅ Filter: semua, belum dibalas, featured
- ✅ Balas review dengan custom message
- ✅ Pin review ke homepage (featured)
- ✅ Approve/reject review
- ✅ Delete review

### Homepage
- ✅ Tampilkan featured reviews
- ✅ Tampilkan admin replies
- ✅ Max 10 reviews ditampilkan
- ✅ Sorted by newest first

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Kolom tidak ada di DB | Run `node setup_review_feature.js` |
| API returns 404 | Restart server setelah update routes |
| Frontend functions undefined | Clear browser cache & restart |
| Foreign key error | Make sure `admin_users` table exists |
| Balasan tidak tersimpan | Check adminId valid di database |

## 📊 Database Schema

```sql
-- Kolom baru di tabel reviews:
adminId INT              -- Reference ke admin_users.id
adminReply TEXT          -- Isi balasan admin
repliedAt TIMESTAMP      -- Waktu admin memberi balasan
isFeatured BOOLEAN       -- True = tampil di homepage
isApproved BOOLEAN       -- True = tampil ke user (default TRUE)
```

## ✨ Tips & Tricks

1. **Bulk Feature Reviews:** Buat beberapa featured reviews untuk homepage lebih menarik
2. **Cepat Balas:** Gunakan template balasan di admin panel untuk konsistensi
3. **Monitoring:** Lihat filter "Pending Reply" secara berkala
4. **Engagement:** Featured reviews dengan admin reply biasanya lebih persuasif

## 📞 Support

Untuk issues:
1. Check `ADMIN_REVIEW_MANAGEMENT.md` untuk docs lengkap
2. Lihat server logs untuk backend errors
3. Check browser console untuk frontend errors
4. Verify database columns ada sebelum test

---

**Siap?** Jalankan `node setup_review_feature.js` untuk mulai! 🚀
