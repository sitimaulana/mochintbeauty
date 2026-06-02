const { promisePool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const runProductCategoriesMigration = async () => {
  try {
    console.log('🔄 Running product_categories migration...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create_product_categories_tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await promisePool.query(statement);
      }
    }
    
    console.log('✅ Product categories migration completed successfully!');
    console.log('📊 Summary:');
    
    // Show results
    const [categories] = await promisePool.query('SELECT COUNT(*) as count FROM categories');
    console.log(`   - Categories created: ${categories[0].count}`);
    
    const [productCats] = await promisePool.query('SELECT COUNT(*) as count FROM product_categories');
    console.log(`   - Product-Category relationships: ${productCats[0].count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

// Export for use in other files
module.exports = runProductCategoriesMigration;

// Run directly if this file is executed
if (require.main === module) {
  runProductCategoriesMigration()
    .then(() => {
      console.log('\n✨ Ready to save products!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to run migration:', err);
      process.exit(1);
    });
}
