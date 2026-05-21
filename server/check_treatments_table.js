const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beauty_clinic',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

async function checkTreatmentsTable() {
  try {
    console.log('=== TABLE SCHEMA ===');
    const [schema] = await promisePool.query('DESCRIBE treatments');
    schema.forEach(col => console.log(`${col.Field}: ${col.Type} (NULL: ${col.Null})`));
    
    console.log('\n=== SAMPLE DATA ===');
    const [records] = await promisePool.query('SELECT * FROM treatments LIMIT 3');
    records.forEach(rec => console.log(JSON.stringify(rec, null, 2)));
    
    console.log('\n=== TOTAL RECORDS ===');
    const [count] = await promisePool.query('SELECT COUNT(*) as cnt FROM treatments');
    console.log(`Total: ${count[0].cnt}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

checkTreatmentsTable();
