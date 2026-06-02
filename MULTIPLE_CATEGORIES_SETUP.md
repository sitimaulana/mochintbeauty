# Multiple Categories Implementation Setup Guide

## Overview
Products can now have **multiple categories** instead of just one!

## Setup Instructions

### Step 1: Run Database Migration
Execute the migration SQL file to create the new database structure:

```bash
# In your MySQL client or via command line
mysql -u [username] -p [database_name] < server/migrations/add_multiple_categories.sql
```

Or run the SQL commands manually in your MySQL console:
```sql
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_category (product_id, category_id)
);

-- Migrate existing categories
INSERT IGNORE INTO categories (name)
SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON p.category = c.name
WHERE p.category IS NOT NULL AND p.category != '';
```

### Step 2: Restart Backend Server
```bash
cd server
npm restart
# or
node server.js
```

### Step 3: Test the Features

#### Admin Panel - Add Multiple Categories
1. Go to Product Management
2. Click "Tambah Produk" (Add Product)
3. In the Category section, you can now **select multiple categories** using checkboxes
4. Categories are displayed as tags once selected

#### Admin Panel - Add New Category
1. In the Category section, type new category name
2. Click "+ Tambah" (Add)
3. New category appears in the checkbox list and is automatically selected

#### Public View - Category Filtering
1. Products now display all their categories
2. Category filtering works with products having multiple categories
3. Product counts in filters update correctly

#### Product Detail - Multiple Categories
1. Click on a product to view details
2. All assigned categories are displayed as tags/badges

## API Endpoints

### Get All Categories
```http
GET /api/products/api/categories
```

### Create Category (Admin Only)
```http
POST /api/products/categories
Content-Type: application/json
Authorization: Bearer [token]

{
  "name": "Category Name"
}
```

### Delete Category (Admin Only)
```http
DELETE /api/products/categories/:categoryId
Authorization: Bearer [token]
```

### Create/Update Product with Multiple Categories
```http
POST /api/products
Content-Type: application/json
Authorization: Bearer [token]

{
  "name": "Product Name",
  "categories": ["Acne", "Brightening", "Best Seller"],
  "price": 50000,
  "weight": 100,
  "description": "Product description",
  "image": "image_url",
  "discountPercentage": 10,
  "promoStartDate": "2024-01-01",
  "promoEndDate": "2024-12-31",
  "marketplaceLinks": {
    "shopee": "https://...",
    "tokopedia": "https://...",
    "lazada": "https://...",
    "other": "https://..."
  }
}
```

## Response Format

### Get Product
```json
{
  "id": 1,
  "name": "Product Name",
  "categories": ["Acne", "Brightening"],
  "category": "Acne",
  "price": 50000,
  "weight": 100,
  "description": "Description",
  "image": "url",
  "marketplaceLinks": {
    "shopee": "url",
    "tokopedia": "url",
    "lazada": "url",
    "other": "url"
  },
  "discount_percentage": 10,
  "promo_start_date": "2024-01-01",
  "promo_end_date": "2024-12-31"
}
```

## Important Notes

⚠️ **Backward Compatibility**
- Old products with single `category` value are automatically migrated to the new structure
- The `category` field is kept for backward compatibility but should be considered deprecated
- New products should use `categories` array

⚠️ **Validation**
- Products MUST have at least one category
- Category names are case-sensitive

⚠️ **Delete Behavior**
- Deleting a category removes it from all products
- Deleting a product also removes its category relationships

## Troubleshooting

### Categories Not Showing in Admin
- Clear browser cache (Ctrl+Shift+Delete)
- Reload the page
- Check browser console for errors (F12)

### Can't Select Multiple Categories
- Make sure you're using checkboxes, not radio buttons
- Check that your browser allows multiple selections

### Products Not Filtering Correctly
- Verify migration was run successfully
- Check that products have categories in product_categories table
- Reload the page

## Files Modified

### Backend
- `server/models/Products.js` - Product model with multiple category support
- `server/controllers/productsController.js` - Updated CRUD operations
- `server/routes/productsRoute.js` - New category endpoints
- `server/migrations/add_multiple_categories.sql` - Database migration

### Frontend
- `src/pages/admin/Product.jsx` - Multi-select category UI
- `src/pages/public/Product.jsx` - Updated filtering logic
- `src/pages/public/ProductDetail.jsx` - Multiple category display

## Questions or Issues?
See `MULTIPLE_CATEGORIES_SETUP.md` for detailed documentation.
