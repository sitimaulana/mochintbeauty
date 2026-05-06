const { promisePool } = require('../config/database');

class Reviews {
    // Get all reviews dengan data member dan admin reply
    static async list() {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                ORDER BY r.createdAt DESC
            `);
            
            console.log('✅ Reviews fetched with member and admin data:', rows);
            return rows;
        } catch (error) {
            console.error('❌ Error in Reviews.list:', error);
            throw error;
        }
    }

    // Get review by ID dengan data member dan admin reply
    static async getById(id) {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                WHERE r.id = ?
            `, [id]);
            
            return rows[0];
        } catch (error) {
            console.error('❌ Error in Reviews.getById:', error);
            throw error;
        }
    }

    // Get reviews by user ID dengan data member
    static async getByUserId(userId) {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                WHERE r.userId = ?
                ORDER BY r.createdAt DESC
            `, [userId]);
            
            return rows;
        } catch (error) {
            console.error('❌ Error in Reviews.getByUserId:', error);
            throw error;
        }
    }

    // Create new review - HANYA simpan userId, rating, comment
    static async create(reviewData) {
        try {
            const { userId, rating, comment } = reviewData;
            
            console.log('📝 Creating review:', { userId, rating, comment });
            
            // Validasi userId ada di table members
            const [member] = await promisePool.query(
                'SELECT id, name, address FROM members WHERE id = ?',
                [userId]
            );
            
            if (!member || member.length === 0) {
                throw new Error(`Member dengan ID ${userId} tidak ditemukan`);
            }
            
            console.log('✅ Member found:', member[0]);
            
            // Insert userId, rating, comment, dan set isApproved = 1 (auto-approved)
            const [result] = await promisePool.query(
                `INSERT INTO reviews (userId, rating, comment, isApproved) 
                 VALUES (?, ?, ?, 1)`,
                [userId, rating, comment]
            );
            
            console.log('✅ Review inserted, ID:', result.insertId);
            
            // Fetch review baru dengan JOIN ke members
            const [newReview] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.isApproved,
                    r.isFeatured,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                WHERE r.id = ?
            `, [result.insertId]);
            
            console.log('✅ Review created with member data:', newReview[0]);
            return newReview[0];
        } catch (error) {
            console.error('❌ Error in Reviews.create:', error);
            throw error;
        }
    }

    // Update review - HANYA update rating dan comment
    static async update(id, reviewData) {
        try {
            const { rating, comment } = reviewData;
            
            console.log('📝 Updating review:', { id, rating, comment });
            
            await promisePool.query(
                'UPDATE reviews SET rating = ?, comment = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [rating, comment, id]
            );
            
            // Return updated review dengan JOIN
            const [updated] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    m.name,
                    m.email,
                    m.address as location
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                WHERE r.id = ?
            `, [id]);
            
            console.log('✅ Review updated:', updated[0]);
            return updated[0];
        } catch (error) {
            console.error('❌ Error in Reviews.update:', error);
            throw error;
        }
    }

    // Delete review
    static async delete(id) {
        try {
            console.log('🗑️ Deleting review:', id);
            
            const [result] = await promisePool.query(
                'DELETE FROM reviews WHERE id = ?',
                [id]
            );
            
            console.log('✅ Review deleted, affected rows:', result.affectedRows);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('❌ Error in Reviews.delete:', error);
            throw error;
        }
    }

    // Admin memberi balasan untuk review
    static async addAdminReply(id, adminId, adminReply) {
        try {
            console.log('💬 Adding admin reply:', { id, adminId, adminReply });
            
            // Validasi admin exists
            const [admin] = await promisePool.query(
                'SELECT id, full_name FROM admin_users WHERE id = ?',
                [adminId]
            );
            
            if (!admin || admin.length === 0) {
                throw new Error(`Admin dengan ID ${adminId} tidak ditemukan`);
            }
            
            console.log('✅ Admin found:', admin[0]);
            
            // Update review dengan admin reply
            await promisePool.query(
                `UPDATE reviews 
                 SET adminId = ?, adminReply = ?, repliedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [adminId, adminReply, id]
            );
            
            // Return updated review
            const [updated] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                WHERE r.id = ?
            `, [id]);
            
            console.log('✅ Admin reply added:', updated[0]);
            return updated[0];
        } catch (error) {
            console.error('❌ Error in Reviews.addAdminReply:', error);
            throw error;
        }
    }

    // Update admin reply
    static async updateAdminReply(id, adminReply) {
        try {
            console.log('✏️ Updating admin reply:', { id, adminReply });
            
            // Update review dengan admin reply baru
            await promisePool.query(
                `UPDATE reviews 
                 SET adminReply = ?, repliedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [adminReply, id]
            );
            
            // Return updated review
            const [updated] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                WHERE r.id = ?
            `, [id]);
            
            console.log('✅ Admin reply updated:', updated[0]);
            return updated[0];
        } catch (error) {
            console.error('❌ Error in Reviews.updateAdminReply:', error);
            throw error;
        }
    }

    // Delete admin reply
    static async deleteAdminReply(id) {
        try {
            console.log('🗑️ Deleting admin reply:', { id });
            
            // Update review dengan admin reply di-clear
            await promisePool.query(
                `UPDATE reviews 
                 SET adminId = NULL, adminReply = NULL, repliedAt = NULL, updatedAt = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [id]
            );
            
            // Return updated review
            const [updated] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                WHERE r.id = ?
            `, [id]);
            
            console.log('✅ Admin reply deleted:', updated[0]);
            return updated[0];
        } catch (error) {
            console.error('❌ Error in Reviews.deleteAdminReply:', error);
            throw error;
        }
    }

    // Toggle featured status (untuk halaman depan)
    static async toggleFeatured(id, isFeatured) {
        try {
            console.log('⭐ Toggling featured status:', { id, isFeatured });
            
            await promisePool.query(
                'UPDATE reviews SET isFeatured = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [isFeatured, id]
            );
            
            const [updated] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                WHERE r.id = ?
            `, [id]);
            
            console.log('✅ Featured status updated:', updated[0]);
            return updated[0];
        } catch (error) {
            console.error('❌ Error in Reviews.toggleFeatured:', error);
            throw error;
        }
    }

    // Toggle approved status
    static async toggleApproved(id, isApproved) {
        try {
            console.log('✔️ Toggling approved status:', { id, isApproved });
            
            await promisePool.query(
                'UPDATE reviews SET isApproved = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                [isApproved, id]
            );
            
            const [updated] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                WHERE r.id = ?
            `, [id]);
            
            console.log('✅ Approved status updated:', updated[0]);
            return updated[0];
        } catch (error) {
            console.error('❌ Error in Reviews.toggleApproved:', error);
            throw error;
        }
    }

    // Get featured reviews untuk homepage
    static async getFeaturedReviews() {
        try {
            const [rows] = await promisePool.query(`
                SELECT 
                    r.id,
                    r.userId,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    r.updatedAt,
                    r.adminId,
                    r.adminReply,
                    r.repliedAt,
                    r.isFeatured,
                    r.isApproved,
                    m.name,
                    m.email,
                    m.address as location,
                    a.full_name as adminName
                FROM reviews r
                INNER JOIN members m ON r.userId = m.id
                LEFT JOIN admin_users a ON r.adminId = a.id
                WHERE r.isFeatured = TRUE AND r.isApproved = TRUE
                ORDER BY r.createdAt DESC
                LIMIT 10
            `);
            
            console.log('✅ Featured reviews fetched:', rows);
            return rows;
        } catch (error) {
            console.error('❌ Error in Reviews.getFeaturedReviews:', error);
            throw error;
        }
    }
}

module.exports = Reviews;