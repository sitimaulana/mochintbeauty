# 🎉 Admin Review Management - Setup Guide Ringkas

**Status:** ✅ READY TO USE

---

## 🚀 Quick Setup (5 Menit)

### 1. Database Migration
```bash
cd server
node setup_review_feature.js
```

Expected output:
```
✅ Added column: adminId
✅ Added column: adminReply
✅ Added column: repliedAt
✅ Added column: isFeatured
✅ Added column: isApproved
✅ Added foreign key
```

### 2. Add Admin Route (Di file admin routes config)
```jsx
import ReviewManagement from '../pages/admin/ReviewManagement';

// Di dalam Routes
<Route path="/admin/reviews" element={<ReviewManagement />} />
```

### 3. Add Navbar Link (Di admin navbar/menu)
```jsx
<Link to="/admin/reviews" className="menu-item">
  📝 Review Management
</Link>
```

### 4. Integrate Featured Reviews di Homepage (Optional)
```jsx
import FeaturedReviews from './components/FeaturedReviews';

// Di dalam Home component
<FeaturedReviews />
```

### 5. Test Feature
```
1. Member buka "My Review" page
2. Create review dengan rating + komentar
3. Admin buka Admin > Review Management
4. Admin lihat review yang baru dibuat
5. Admin klik Reply, tulis balasan
6. Admin klik Featured toggle
7. Member refresh halaman, lihat balasan admin
8. Homepage tampil featured reviews
```

---

## 📡 API Endpoints

### User Endpoints
```
POST   /api/reviews                  Create review
GET    /api/reviews/user/:userId     Get my reviews
PUT    /api/reviews/:id              Update my review
GET    /api/reviews/featured         Get featured (public)
```

### Admin Endpoints (NEW)
```
GET    /api/reviews                           Get all reviews
POST   /api/reviews/:id/admin-reply           Add reply
PUT    /api/reviews/:id/featured              Toggle featured
PUT    /api/reviews/:id/approved              Toggle approval
DELETE /api/reviews/:id                       Delete review
```

---

## 🎨 New Components

### 1. ReviewManagement (Admin Panel)
```jsx
import ReviewManagement from '../pages/admin/ReviewManagement';
<Route path="/admin/reviews" element={<ReviewManagement />} />
```

**Features:**
- List semua reviews
- Filter: Semua, Belum Dibalas, Featured
- Reply inline form
- Action buttons: Featured, Approve, Delete

### 2. FeaturedReviews (Homepage)
```jsx
import FeaturedReviews from './components/FeaturedReviews';
<FeaturedReviews /> // Di homepage
```

**Features:**
- Display 3-column grid (responsive)
- Show customer name, rating, comment
- Show admin reply if exists

### 3. Review Page Update (Member)
- Show list of your reviews
- Display admin replies
- Edit own review

---

## 📦 Files yang Berubah

**Backend:**
- ✅ `server/models/Reviews.js`
- ✅ `server/controllers/reviewsController.js`
- ✅ `server/routes/reviewsRoutes.js`

**Frontend:**
- ✅ `src/api/client.js`
- ✅ `src/pages/member/Review.jsx`
- ✅ `src/pages/admin/ReviewManagement.jsx` (NEW)
- ✅ `src/components/FeaturedReviews.jsx` (NEW)

**Database Migration:**
- ✅ `server/setup_review_feature.js` (NEW - jalankan ini!)
- ✅ `server/add_admin_reply_to_reviews.js` (NEW)

**Documentation:**
- ✅ `ADMIN_REVIEW_MANAGEMENT.md` - Full docs
- ✅ `REVIEW_FEATURE_QUICKSTART.md` - Detailed guide
- ✅ `IMPLEMENTATION_SUMMARY.md` - Updated with review feature

---

## 💡 Key Features

| Feature | User | Admin | Homepage |
|---------|------|-------|----------|
| Create Review | ✅ | ❌ | ❌ |
| Edit Review | ✅ | ❌ | ❌ |
| See Admin Reply | ✅ | ❌ | ❌ |
| Admin Reply | ❌ | ✅ | ❌ |
| Mark Featured | ❌ | ✅ | ✅ |
| Show on Homepage | ❌ | ❌ | ✅ |

---

## 🔧 Frontend API Usage

```javascript
import { 
  getReviews,
  getFeaturedReviews,
  postReview,
  addAdminReply,
  toggleFeatured,
  toggleApproved,
  deleteReview
} from '../../api/client';

// Member create review
await postReview({ userId, rating, comment });

// Get featured for homepage
const reviews = await getFeaturedReviews();

// Admin reply
await addAdminReply(reviewId, { adminId, adminReply });

// Admin toggle featured
await toggleFeatured(reviewId, true);
```

---

## 📊 Database Structure

### New Columns Added to `reviews`:
```sql
adminId INT                 -- Admin yang reply
adminReply TEXT             -- Isi reply dari admin
repliedAt TIMESTAMP         -- Kapan admin reply
isFeatured BOOLEAN          -- Tampil di homepage?
isApproved BOOLEAN          -- Approval status
```

---

## ✅ Deployment Checklist

- [ ] Run `node setup_review_feature.js`
- [ ] Verify columns added dengan `DESC reviews;`
- [ ] Add admin route di routing config
- [ ] Add navbar link
- [ ] Test member create review
- [ ] Test admin reply
- [ ] Test featured toggle
- [ ] Add FeaturedReviews component ke homepage
- [ ] Test homepage display
- [ ] Go live!

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| API returns 404 | Restart server after route update |
| Frontend can't import | Clear cache & restart dev server |
| Column not exist | Run `node setup_review_feature.js` |
| Admin reply tidak save | Check adminId valid di database |
| Featured tidak tampil | Verify isFeatured = TRUE dan isApproved = TRUE |

---

## 📚 More Info

- **Full Docs:** `ADMIN_REVIEW_MANAGEMENT.md`
- **Quick Guide:** `REVIEW_FEATURE_QUICKSTART.md`  
- **Setup Instructions:** Look above ☝️

---

**Ready to go!** 🚀 Run setup command dan nikmati fitur admin review management.
