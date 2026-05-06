const fs = require('fs');
const path = require('path');
const { promisePool } = require('./config/database');

const createMedicalRecordsTable = async () => {
  try {
    console.log('🔄 Creating medical_records table...');
    
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'create_medical_records_table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute SQL statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await promisePool.query(statement);
      }
    }
    
    console.log('✅ medical_records table created successfully');
    
  } catch (error) {
    console.error('❌ Error creating medical_records table:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  createMedicalRecordsTable().then(() => {
    console.log('✨ Migration complete');
    process.exit(0);
  });
}

module.exports = createMedicalRecordsTable;
