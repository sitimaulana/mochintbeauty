// Migration runner script
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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
    console.log('🔄 Running migration...\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_multiple_categories.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute CREATE TABLE statements
    const createTablesSQL = [
      `CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS product_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        category_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_category (product_id, category_id)
      )`
    ];

    // Execute CREATE TABLE statements
    for (const statement of createTablesSQL) {
      try {
        console.log(`📝 Creating table...`);
        await connection.query(statement);
        console.log('✅ Table created\n');
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️  Table already exists (skipping)\n');
        } else {
          throw err;
        }
      }
    }

    // Migrate existing data
    console.log('📊 Migrating existing categories...');
    try {
      const insertCategoriesSQL = `
        INSERT IGNORE INTO categories (name)
        SELECT DISTINCT category FROM products 
        WHERE category IS NOT NULL AND category != ''
      `;
      const result = await connection.query(insertCategoriesSQL);
      console.log(`✅ Inserted ${result[0].affectedRows} categories\n`);
    } catch (err) {
      console.log('⚠️  Skip migration (possibly already done)\n');
    }

    console.log('🔗 Creating product-category relationships...');
    try {
      const insertRelationsSQL = `
        INSERT IGNORE INTO product_categories (product_id, category_id)
        SELECT p.id, c.id
        FROM products p
        JOIN categories c ON p.category = c.name
        WHERE p.category IS NOT NULL AND p.category != ''
      `;
      const result = await connection.query(insertRelationsSQL);
      console.log(`✅ Created ${result[0].affectedRows} relationships\n`);
    } catch (err) {
      console.log('⚠️  Skip relationship creation (possibly already done)\n');
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
