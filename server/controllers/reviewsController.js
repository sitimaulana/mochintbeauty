const Reviews = require('../models/Reviews');

exports.listReviews = async (req, res) => {
    try {
        console.log('📋 Fetching all reviews...');
        const reviews = await Reviews.list();
        console.log(`✅ Found ${reviews.length} reviews`);
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('❌ Error listing reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReviewById = async (req, res) => {
    try {
        const review = await Reviews.getById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
        }
        res.json({ success: true, data: review });
    } catch (error) {
        console.error('❌ Error getting review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReviewsByUserId = async (req, res) => {
    try {
        const reviews = await Reviews.getByUserId(req.params.userId);
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('❌ Error getting user reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFeaturedReviews = async (req, res) => {
    try {
        console.log('⭐ Fetching featured reviews for homepage...');
        const reviews = await Reviews.getFeaturedReviews();
        console.log(`✅ Found ${reviews.length} featured reviews`);
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('❌ Error getting featured reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { userId, rating, comment } = req.body;
        
        console.log('➕ Received:', req.body);
        
        // VALIDASI BARU - TIDAK ADA CEK NAME!
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID wajib diisi' });
        }
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating harus 1-5' });
        }
        
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Komentar wajib diisi' });
        }
        
        const review = await Reviews.create({ userId, rating, comment: comment.trim() });
        
        console.log('✅ Review created:', review);
        
        res.status(201).json({ success: true, message: 'Review berhasil dibuat', data: review });
    } catch (error) {
        console.error('❌ Error creating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating harus 1-5' });
        }
        
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Komentar wajib diisi' });
        }
        
        const review = await Reviews.update(req.params.id, { rating, comment: comment.trim() });
        
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Review berhasil diperbarui', data: review });
    } catch (error) {
        console.error('❌ Error updating review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin memberi balasan untuk review
exports.addAdminReply = async (req, res) => {
    try {
        const { adminId, adminReply } = req.body;
        const reviewId = req.params.id;
        
        console.log('💬 Admin adding reply:', { reviewId, adminId, adminReply });
        
        if (!adminId) {
            return res.status(400).json({ success: false, message: 'Admin ID wajib diisi' });
        }
        
        if (!adminReply || !adminReply.trim()) {
            return res.status(400).json({ success: false, message: 'Balasan wajib diisi' });
        }
        
        const review = await Reviews.addAdminReply(reviewId, adminId, adminReply.trim());
        
        console.log('✅ Admin reply added:', review);
        
        res.json({ success: true, message: 'Balasan berhasil ditambahkan', data: review });
    } catch (error) {
        console.error('❌ Error adding admin reply:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin edit balasan
exports.updateAdminReply = async (req, res) => {
    try {
        const { adminReply } = req.body;
        const reviewId = req.params.id;
        
        console.log('✏️ Admin updating reply:', { reviewId, adminReply });
        
        if (!adminReply || !adminReply.trim()) {
            return res.status(400).json({ success: false, message: 'Balasan wajib diisi' });
        }
        
        const review = await Reviews.updateAdminReply(reviewId, adminReply.trim());
        
        console.log('✅ Admin reply updated:', review);
        
        res.json({ success: true, message: 'Balasan berhasil diperbarui', data: review });
    } catch (error) {
        console.error('❌ Error updating admin reply:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin hapus balasan
exports.deleteAdminReply = async (req, res) => {
    try {
        const reviewId = req.params.id;
        
        console.log('🗑️ Admin deleting reply:', { reviewId });
        
        const review = await Reviews.deleteAdminReply(reviewId);
        
        console.log('✅ Admin reply deleted:', review);
        
        res.json({ success: true, message: 'Balasan berhasil dihapus', data: review });
    } catch (error) {
        console.error('❌ Error deleting admin reply:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle featured status
exports.toggleFeatured = async (req, res) => {
    try {
        const { isFeatured } = req.body;
        const reviewId = req.params.id;
        
        console.log('⭐ Toggling featured status:', { reviewId, isFeatured });
        
        if (isFeatured === undefined) {
            return res.status(400).json({ success: false, message: 'Status featured wajib diisi' });
        }
        
        const review = await Reviews.toggleFeatured(reviewId, isFeatured);
        
        console.log('✅ Featured status updated:', review);
        
        res.json({ 
            success: true, 
            message: isFeatured ? 'Review ditampilkan di homepage' : 'Review disembunyikan dari homepage', 
            data: review 
        });
    } catch (error) {
        console.error('❌ Error toggling featured:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle approved status
exports.toggleApproved = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const reviewId = req.params.id;
        
        console.log('✔️ Toggling approved status:', { reviewId, isApproved });
        
        if (isApproved === undefined) {
            return res.status(400).json({ success: false, message: 'Status approved wajib diisi' });
        }
        
        const review = await Reviews.toggleApproved(reviewId, isApproved);
        
        console.log('✅ Approved status updated:', review);
        
        res.json({ 
            success: true, 
            message: isApproved ? 'Review disetujui' : 'Review ditolak', 
            data: review 
        });
    } catch (error) {
        console.error('❌ Error toggling approved:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const deleted = await Reviews.delete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Review tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Review berhasil dihapus' });
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

