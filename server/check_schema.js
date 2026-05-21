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
    console.log('=== DESCRIBE TREATMENTS ===');
    const [schema] = await promisePool.query('DESCRIBE treatments');
    console.log(schema);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

checkTreatmentsTable();
