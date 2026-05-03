# Fitur Admin Review Management

Dokumentasi lengkap untuk fitur admin reply dan featured reviews di Mochint Beauty.

## 📋 Daftar Fitur

### 1. **Admin Reply untuk Reviews**
   - Admin dapat memberikan balasan untuk setiap review dari customer
   - Balasan disimpan dengan timestamp dan nama admin yang memberi balasan
   - Customer dapat melihat balasan admin di halaman review mereka

### 2. **Featured Reviews di Homepage**
   - Admin dapat memilih review mana yang akan ditampilkan di halaman depan
   - Review yang di-featured akan lebih terlihat oleh calon customer
   - Maksimal 10 featured reviews ditampilkan berdasarkan tanggal terbaru

### 3. **Approval System**
   - Admin dapat menyetujui atau menolak review
   - Review yang ditolak tidak akan tampil di homepage
   - Default review adalah approved (dapat diubah sesuai kebutuhan)

## 🗄️ Database Changes

### Kolom Baru di Tabel `reviews`:

```sql
ALTER TABLE reviews 
ADD COLUMN adminId INT DEFAULT NULL AFTER userId,
ADD COLUMN adminReply TEXT DEFAULT NULL,
ADD COLUMN repliedAt TIMESTAMP DEFAULT NULL,
ADD COLUMN isFeatured BOOLEAN DEFAULT FALSE,
ADD COLUMN isApproved BOOLEAN DEFAULT TRUE,
ADD FOREIGN KEY (adminId) REFERENCES admin_users(id) ON DELETE SET NULL;
```

### Penjelasan Kolom:
- `adminId`: ID admin yang memberi balasan
- `adminReply`: Isi balasan dari admin
- `repliedAt`: Timestamp kapan admin memberi balasan
- `isFeatured`: Flag untuk menampilkan di homepage
- `isApproved`: Flag untuk approval status

## 🚀 Setup

### 1. Run Migration
```bash
cd server
node add_admin_reply_to_reviews.js
```

### 2. Verifikasi Database
Setelah migration, cek bahwa kolom baru sudah ditambahkan:
```sql
DESC reviews;
```

## 📡 API Endpoints

### Get All Reviews
```
GET /api/reviews
Response: { success: true, count: X, data: [...] }
```

### Get Featured Reviews (untuk Homepage)
```
GET /api/reviews/featured
Response: { success: true, count: X, data: [...] }
```

### Get Review by ID
```
GET /api/reviews/:id
```

### Get Reviews by User
```
GET /api/reviews/user/:userId
```

### Create Review (User)
```
POST /api/reviews
Body: { userId, rating, comment }
```

### Update Review (User)
```
PUT /api/reviews/:id
Body: { rating, comment }
```

### Admin - Add Reply (NEW)
```
POST /api/reviews/:id/admin-reply
Body: { adminId, adminReply }
Response: { success: true, message: "Balasan berhasil ditambahkan", data: {...} }
```

### Admin - Toggle Featured (NEW)
```
PUT /api/reviews/:id/featured
Body: { isFeatured: true/false }
Response: { success: true, message: "Review ditampilkan/disembunyikan di homepage", data: {...} }
```

### Admin - Toggle Approved (NEW)
```
PUT /api/reviews/:id/approved
Body: { isApproved: true/false }
Response: { success: true, message: "Review disetujui/ditolak", data: {...} }
```

### Delete Review (Admin only)
```
DELETE /api/reviews/:id
```

## 🎨 Frontend Components

### ReviewManagement.jsx
Path: `src/pages/admin/ReviewManagement.jsx`

Fitur:
- List semua reviews dengan filter (Semua, Belum Dibalas, Featured)
- Tampilkan rating bintang
- Tampilkan info review (nama, tanggal, komentar)
- Tombol untuk:
  - Add/Remove dari featured (⭐)
  - Approve/Reject review (✓/✗)
  - Delete review (🗑️)
  - Reply to review (💬)
- Form inline untuk memberi balasan
- Tampilkan existing admin replies

### Contoh Penggunaan:
```jsx
import ReviewManagement from './pages/admin/ReviewManagement';

<ReviewManagement />
```

## 🔧 Frontend API Usage

### Menggunakan Convenience Exports
```javascript
import { 
  getReviews,
  getFeaturedReviews,
  addAdminReply,
  toggleFeatured,
  toggleApproved,
  deleteReview
} from '../../api/client';

// Ambil semua reviews
const response = await getReviews();

// Ambil featured reviews
const featured = await getFeaturedReviews();

// Admin memberi balasan
await addAdminReply(reviewId, {
  adminId: admin.id,
  adminReply: "Terima kasih atas review Anda..."
});

// Toggle featured status
await toggleFeatured(reviewId, true);

// Toggle approval
await toggleApproved(reviewId, false);
```

### Menggunakan reviewsAPI Object
```javascript
import { reviewsAPI } from '../../api/client';

const reviews = await reviewsAPI.getAll();
const featured = await reviewsAPI.getFeatured();
await reviewsAPI.addAdminReply(id, replyData);
```

## 📱 Struktur Data Review

```javascript
{
  id: 1,
  userId: 260021,
  rating: 5,
  comment: "Pelayanan sangat memuaskan!",
  createdAt: "2026-03-04T07:44:23.000Z",
  updatedAt: "2026-03-04T07:44:23.000Z",
  
  // Member info
  name: "Siti Maulana",
  email: "siti@example.com",
  location: "Jakarta",
  
  // Admin reply
  adminId: 2,
  adminName: "System Admin",
  adminReply: "Terima kasih telah mempercayai layanan kami!",
  repliedAt: "2026-03-05T10:30:00.000Z",
  
  // Status
  isFeatured: true,
  isApproved: true
}
```

## 🔍 Integrasi di Homepage

Untuk menampilkan featured reviews di homepage:

```jsx
import { getFeaturedReviews } from '../../api/client';

export default function HomePage() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadFeaturedReviews = async () => {
      const data = await getFeaturedReviews();
      setReviews(data.data);
    };
    loadFeaturedReviews();
  }, []);

  return (
    <section className="testimonials">
      {reviews.map(review => (
        <div key={review.id} className="review-card">
          <h4>{review.name}</h4>
          <p>⭐ {review.rating}/5</p>
          <p>{review.comment}</p>
          {review.adminReply && (
            <div className="admin-reply">
              <strong>Admin Reply:</strong>
              <p>{review.adminReply}</p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
```

## ✅ Testing Checklist

### Backend Testing
- [ ] Migration berhasil menambah kolom
- [ ] API GET /api/reviews/featured mengembalikan featured reviews
- [ ] API POST /api/reviews/:id/admin-reply menyimpan balasan
- [ ] API PUT /api/reviews/:id/featured toggle isFeatured
- [ ] API PUT /api/reviews/:id/approved toggle isApproved
- [ ] Member data tetap ter-JOIN dengan benar

### Frontend Testing
- [ ] Admin panel ReviewManagement load semua reviews
- [ ] Filter works: Semua, Belum Dibalas, Featured
- [ ] Tombol featured, approve, delete bekerja
- [ ] Form reply inline muncul dan bisa submit
- [ ] Admin reply ditampilkan setelah submit
- [ ] Featured reviews muncul di homepage

## 🐛 Troubleshooting

### Kolom belum ada di database?
```bash
# Jalankan manual migration
cd server
node add_admin_reply_to_reviews.js
```

### API returns 404?
- Pastikan route sudah di-order dengan benar (spesifik lebih dulu)
- Cek `/api/reviews/featured` sebelum `/api/reviews/:id`

### Frontend tidak bisa import fungsi?
- Pastikan `export const` sudah ditambahkan di client.js
- Clear cache: `npm run dev`

### Balasan tidak tersimpan?
- Check browser console untuk error message
- Cek adminId valid di database
- Verify token/authentication

## 📝 Notes

- Semua review default adalah `isApproved: TRUE` (ditampilkan)
- Featured reviews maximum 10 items
- Admin reply tidak wajib sebelum featured
- Menghapus review juga menghapus balaasan admin
- Email notifikasi bisa ditambahkan di feature berikutnya
