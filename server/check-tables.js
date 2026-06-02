// Check database tables
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beauty_clinic',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Checking tables in database...\n');
    
    // Check if tables exist
    const query = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`;
    const [rows] = await connection.query(query, [process.env.DB_NAME || 'beauty_clinic']);
    
    console.log('Tables in database:');
    rows.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    
    console.log('\nLooking for specific tables:');
    const tableNames = rows.map(r => r.TABLE_NAME);
    console.log(`  categories: ${tableNames.includes('categories') ? '✅ Found' : '❌ Not found'}`);
    console.log(`  product_categories: ${tableNames.includes('product_categories') ? '✅ Found' : '❌ Not found'}`);
    
    // Test query
    console.log('\nTesting query...');
    try {
      const testQuery = `
        SELECT p.*, GROUP_CONCAT(c.name) as categories
        FROM products p
        LEFT JOIN product_categories pc ON p.id = pc.product_id
        LEFT JOIN categories c ON pc.category_id = c.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      const [result] = await connection.query(testQuery);
      console.log(`✅ Query successful! Found ${result.length} products`);
    } catch (err) {
      console.log(`❌ Query failed: ${err.message}`);
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
  }
}

checkTables();
