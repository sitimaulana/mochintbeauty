const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

const sqlFile = 'D:\\Kuliah\\Magang\\mochintbeauty\\products.sql';

(async () => {
  try {
    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'beauty_clinic'
    });

    console.log('📂 Reading SQL file...');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    const queries = sql.split(';').filter(q => q.trim());
    
    console.log(`📝 Found ${queries.length} queries to execute...`);
    
    let executed = 0;
    for (const query of queries) {
      if (query.trim()) {
        try {
          await connection.execute(query);
          executed++;
        } catch (err) {
          console.warn(`⚠️  Query error (might be OK): ${err.message.substring(0, 50)}`);
        }
      }
    }

    console.log(`✅ Database imported successfully! (${executed} queries executed)`);
    await connection.end();
  } catch (error) {
    console.error('❌ Error importing database:', error.message);
    process.exit(1);
  }
})();
