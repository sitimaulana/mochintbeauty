#!/usr/bin/env node

/**
 * Setup Admin Review Management Feature
 * Jalankan script ini setelah upload kode untuk auto-setup database
 */

const { promisePool } = require('./config/database');

async function setupReviewFeature() {
  try {
    console.log('🚀 Starting Review Management Feature Setup...\n');

    // Check if columns already exist
    const [columns] = await promisePool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'reviews' AND TABLE_SCHEMA = DATABASE()`
    );
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    const hasAdminReply = columnNames.includes('adminReply');
    const isFeatured = columnNames.includes('isFeatured');
    const isApproved = columnNames.includes('isApproved');

    if (hasAdminReply && isFeatured && isApproved) {
      console.log('✅ All columns already exist! Feature is ready to use.\n');
      return true;
    }

    console.log('📝 Adding new columns to reviews table...\n');

    // Add columns one by one (without IF NOT EXISTS for compatibility)
    const columnsToAdd = [
      { name: 'adminId', def: 'INT DEFAULT NULL' },
      { name: 'adminReply', def: 'TEXT DEFAULT NULL' },
      { name: 'repliedAt', def: 'TIMESTAMP DEFAULT NULL' },
      { name: 'isFeatured', def: 'BOOLEAN DEFAULT FALSE' },
      { name: 'isApproved', def: 'BOOLEAN DEFAULT TRUE' }
    ];

    for (const col of columnsToAdd) {
      try {
        const query = `ALTER TABLE reviews ADD COLUMN ${col.name} ${col.def}`;
        await promisePool.query(query);
        console.log(`  ✅ Added column: ${col.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.sqlMessage.includes('Duplicate column')) {
          console.log(`  ⏭️  Column already exists: ${col.name}`);
        } else {
          throw error;
        }
      }
    }

    // Add foreign key if needed
    try {
      await promisePool.query(
        `ALTER TABLE reviews ADD FOREIGN KEY (adminId) REFERENCES admin_users(id) ON DELETE SET NULL`
      );
      console.log(`  ✅ Added foreign key: adminId -> admin_users(id)`);
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log(`  ⏭️  Foreign key already exists`);
      } else {
        console.log(`  ⚠️  Foreign key skipped:`, error.message);
      }
    }

    console.log('\n✅ Setup completed successfully!\n');
    
    // Show summary
    const [updated] = await promisePool.query(`DESC reviews`);
    console.log('📊 Reviews table structure:\n');
    updated.forEach(row => {
      console.log(`  • ${row.Field}: ${row.Type}${row.Null === 'YES' ? ' (nullable)' : ''}`);
    });

    console.log('\n🎉 Review Management Feature is now active!\n');
    console.log('📚 Documentation: See ADMIN_REVIEW_MANAGEMENT.md\n');
    
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupReviewFeature()
    .then(() => {
      console.log('✨ All done! You can now use Review Management features.');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Setup error:', error);
      process.exit(1);
    });
}

module.exports = { setupReviewFeature };
