// Migration runner script for fee_terapis
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beauty_clinic',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('🔄 Running migration for fee_terapis...');
    
    const alterTableSQL = `
      ALTER TABLE treatments
      ADD COLUMN fee_terapis DECIMAL(10,2) NOT NULL DEFAULT 0
    `;

    try {
      await connection.query(alterTableSQL);
      console.log('✅ Column fee_terapis added to treatments table\n');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Column fee_terapis already exists (skipping)\n');
      } else {
        throw err;
      }
    }
    
    console.log('✅ Migration completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    await connection.end();
    process.exit(1);
  }
}

runMigration();
