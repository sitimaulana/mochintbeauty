const { promisePool } = require('../config/database');

async function addAdminReplyToReviews() {
    try {
        console.log('🔄 Menambahkan kolom admin reply ke tabel reviews...');

        // Cek apakah kolom sudah ada
        const [columns] = await promisePool.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'reviews' AND COLUMN_NAME = 'adminReply'`
        );

        if (columns.length > 0) {
            console.log('✅ Kolom adminReply sudah ada, skip migration');
            return;
        }

        // Tambah kolom
        const queries = [
            `ALTER TABLE reviews ADD COLUMN adminId INT DEFAULT NULL AFTER userId`,
            `ALTER TABLE reviews ADD COLUMN adminReply TEXT DEFAULT NULL`,
            `ALTER TABLE reviews ADD COLUMN repliedAt TIMESTAMP DEFAULT NULL`,
            `ALTER TABLE reviews ADD COLUMN isFeatured BOOLEAN DEFAULT FALSE`,
            `ALTER TABLE reviews ADD COLUMN isApproved BOOLEAN DEFAULT TRUE`,
            `ALTER TABLE reviews ADD FOREIGN KEY (adminId) REFERENCES admin_users(id) ON DELETE SET NULL`
        ];

        for (const query of queries) {
            try {
                await promisePool.query(query);
                console.log('✅', query);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log('⚠️ Kolom sudah ada:', query);
                } else {
                    throw error;
                }
            }
        }

        console.log('✅ Migration selesai: Kolom admin reply berhasil ditambahkan');
    } catch (error) {
        console.error('❌ Error during migration:', error);
        throw error;
    }
}

// Jalankan jika file ini dijalankan langsung
if (require.main === module) {
    addAdminReplyToReviews()
        .then(() => {
            console.log('✅ Database updated successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { addAdminReplyToReviews };
