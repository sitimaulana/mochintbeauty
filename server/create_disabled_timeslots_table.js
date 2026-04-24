const { promisePool } = require('./config/database');

const createDisabledTimeslotsTable = async () => {
  try {
    console.log('📋 Creating disabled_timeslots table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS disabled_timeslots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time_slot VARCHAR(10) NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        UNIQUE KEY unique_date_time (date, time_slot),
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    
    await promisePool.query(createTableSQL);
    console.log('✅ disabled_timeslots table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
};

// Run if executed directly
if (require.main === module) {
  createDisabledTimeslotsTable()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = createDisabledTimeslotsTable;
