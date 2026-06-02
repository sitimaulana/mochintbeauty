const { promisePool } = require('../config/database');

class Products {
    // Get all products with their categories
    static async list() {
        const [rows] = await promisePool.query(`
            SELECT p.*, GROUP_CONCAT(c.name) as categories
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);
        
        // Parse categories string to array
        return rows.map(row => ({
            ...row,
            categories: row.categories ? row.categories.split(',') : []
        }));
    }

    // Get product by ID with categories
    static async getById(id) {
        const [rows] = await promisePool.query(
            `SELECT p.*, GROUP_CONCAT(c.name) as categories
            FROM products p
            LEFT JOIN product_categories pc ON p.id = pc.product_id
            LEFT JOIN categories c ON pc.category_id = c.id
            WHERE p.id = ?
            GROUP BY p.id`,
            [id]
        );
        
        if (!rows[0]) return null;
        
        const product = rows[0];
        return {
            ...product,
            categories: product.categories ? product.categories.split(',') : []
        };
    }

    // Create new product with categories
    static async create(productData) {
        const { 
            name, 
            categories = [], 
            price, 
            weight, 
            description, 
            image, 
            marketplaceLinks,
            discountPercentage,
            promoStartDate,
            promoEndDate
        } = productData;

        const [result] = await promisePool.query(
            `INSERT INTO products 
            (name, price, weight, description, image, marketplace_links, discount_percentage, promo_start_date, promo_end_date, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                name, 
                price, 
                weight || 0, 
                description || '', 
                image || '', 
                JSON.stringify(marketplaceLinks || {}),
                discountPercentage || 0,
                promoStartDate || null,
                promoEndDate || null
            ]
        );

        const productId = result.insertId;

        // Add categories to product
        if (categories && categories.length > 0) {
            await this.addCategoriesToProduct(productId, categories);
        }

        return this.getById(productId);
    }

    // Update product with categories
    static async update(id, productData) {
        const { 
            name, 
            categories = [], 
            price, 
            weight, 
            description, 
            image, 
            marketplaceLinks,
            discountPercentage,
            promoStartDate,
            promoEndDate
        } = productData;

        await promisePool.query(
            `UPDATE products 
            SET name = ?, price = ?, weight = ?, 
                description = ?, image = ?, marketplace_links = ?, 
                discount_percentage = ?, promo_start_date = ?, promo_end_date = ?, updated_at = NOW()
            WHERE id = ?`,
            [
                name, 
                price, 
                weight || 0, 
                description || '', 
                image || '', 
                JSON.stringify(marketplaceLinks || {}),
                discountPercentage || 0,
                promoStartDate || null,
                promoEndDate || null,
                id
            ]
        );

        // Update categories for the product
        await promisePool.query(
            'DELETE FROM product_categories WHERE product_id = ?',
            [id]
        );

        if (categories && categories.length > 0) {
            await this.addCategoriesToProduct(id, categories);
        }

        return this.getById(id);
    }

    // Delete product
    static async delete(id) {
        const [result] = await promisePool.query(
            'DELETE FROM products WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get products by category
    static async getByCategory(category) {
        const [rows] = await promisePool.query(
            `SELECT DISTINCT p.*, GROUP_CONCAT(c.name) as categories
            FROM products p
            JOIN product_categories pc ON p.id = pc.product_id
            JOIN categories c ON pc.category_id = c.id
            WHERE c.name = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC`,
            [category]
        );
        
        return rows.map(row => ({
            ...row,
            categories: row.categories ? row.categories.split(',') : []
        }));
    }

    // Get all categories
    static async getAllCategories() {
        const [rows] = await promisePool.query(
            'SELECT * FROM categories ORDER BY name ASC'
        );
        return rows;
    }

    // Add category (create if not exists)
    static async addCategory(categoryName) {
        const [result] = await promisePool.query(
            'INSERT IGNORE INTO categories (name) VALUES (?)',
            [categoryName]
        );
        
        // Get the category ID
        const [rows] = await promisePool.query(
            'SELECT id FROM categories WHERE name = ?',
            [categoryName]
        );
        
        return rows[0];
    }

    // Delete category
    static async deleteCategory(categoryId) {
        const [result] = await promisePool.query(
            'DELETE FROM categories WHERE id = ?',
            [categoryId]
        );
        return result.affectedRows > 0;
    }

    // Add categories to product
    static async addCategoriesToProduct(productId, categoryNames) {
        for (const categoryName of categoryNames) {
            // First, ensure category exists
            const category = await this.addCategory(categoryName);
            
            // Then add the product-category relationship
            await promisePool.query(
                'INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)',
                [productId, category.id]
            );
        }
    }

    // Remove category from product
    static async removeCategoryFromProduct(productId, categoryId) {
        const [result] = await promisePool.query(
            'DELETE FROM product_categories WHERE product_id = ? AND category_id = ?',
            [productId, categoryId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Products;