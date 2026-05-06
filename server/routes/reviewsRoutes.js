const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

// PENTING: Route yang lebih spesifik harus di atas route yang umum

// GET /api/reviews/featured - Get featured reviews untuk homepage
router.get('/featured', reviewsController.getFeaturedReviews);

// GET /api/reviews/user/:userId - Get reviews by user ID
router.get('/user/:userId', reviewsController.getReviewsByUserId);

// GET /api/reviews - Get all reviews
router.get('/', reviewsController.listReviews);

// GET /api/reviews/:id - Get review by ID
router.get('/:id', reviewsController.getReviewById);

// POST /api/reviews - Create new review
router.post('/', reviewsController.createReview);

// PUT /api/reviews/:id - Update review
router.put('/:id', reviewsController.updateReview);

// POST /api/reviews/:id/admin-reply - Admin memberi balasan
router.post('/:id/admin-reply', reviewsController.addAdminReply);

// PUT /api/reviews/:id/admin-reply - Admin edit balasan
router.put('/:id/admin-reply', reviewsController.updateAdminReply);

// DELETE /api/reviews/:id/admin-reply - Admin hapus balasan
router.delete('/:id/admin-reply', reviewsController.deleteAdminReply);

// PUT /api/reviews/:id/featured - Toggle featured status
router.put('/:id/featured', reviewsController.toggleFeatured);

// PUT /api/reviews/:id/approved - Toggle approved status
router.put('/:id/approved', reviewsController.toggleApproved);

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', reviewsController.deleteReview);

module.exports = router;
