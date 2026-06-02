const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const authenticateToken = require('../middleware/auth');

// Public routes (no auth required)
router.get('/', productsController.getAllProducts);
router.get('/category/:category', productsController.getProductsByCategory);
router.get('/:id', productsController.getProductById);

// Category routes
router.get('/api/categories', productsController.getAllCategories);
router.post('/categories', authenticateToken, productsController.addCategory);
router.delete('/categories/:id', authenticateToken, productsController.deleteCategory);

// Protected routes (auth required) - untuk admin
router.post('/', authenticateToken, productsController.createProduct);
router.put('/:id', authenticateToken, productsController.updateProduct);
router.delete('/:id', authenticateToken, productsController.deleteProduct);

module.exports = router;