/**
 * Initialize database by importing SQL file
 * Usage: node init-db-mysql.js
 */

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'beauty_clinic',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

// Read and execute SQL file
const sqlFile = path.join(__dirname, 'database/beauty_clinic.sql');
console.log(`📄 Reading SQL file from: ${sqlFile}`);

const sql = fs.readFileSync(sqlFile, 'utf8');

// Split by semicolon and filter empty statements
const statements = sql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`📝 Found ${statements.length} SQL statements to execute`);

let executed = 0;
let errors = [];

const executeStatements = (index = 0) => {
  if (index >= statements.length) {
    console.log(`\n✅ Database initialization completed!`);
    console.log(`   Executed: ${executed} statements`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.length}`);
      errors.forEach(err => console.log(`   - ${err}`));
    }
    connection.end();
    process.exit(errors.length > 0 ? 1 : 0);
    return;
  }

  const statement = statements[index];
  
  // Show progress
  if (index % 10 === 0) {
    process.stdout.write(`\rExecuting: ${index + 1}/${statements.length}...`);
  }

  connection.query(statement, (error) => {
    if (error) {
      // Some errors are expected (like "table already exists")
      if (!error.message.includes('already exists') && !error.message.includes('ER_DUP_ENTRY')) {
        errors.push(`Statement ${index + 1}: ${error.message}`);
      }
    }
    executed++;
    executeStatements(index + 1);
  });
};

executeStatements();
