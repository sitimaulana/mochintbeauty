#!/usr/bin/env node

/**
 * Auto Database Setup Script
 * Memastikan MySQL database sudah siap untuk development
 */

const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'beauty_clinic';

console.log('🚀 Mochint Beauty Database Auto-Setup\n');
console.log('📋 Configuration:');
console.log(`   Host: ${DB_HOST}`);
console.log(`   User: ${DB_USER}`);
console.log(`   Database: ${DB_NAME}\n`);

async function setupDatabase() {
  try {
    // Step 1: Connect to MySQL (without specifying database)
    console.log('1️⃣  Connecting to MySQL Server...');
    const connection = mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    connection.connect((err) => {
      if (err) {
        console.error('❌ Connection Error:', err.message);
        console.error('\n⚠️  Troubleshooting:');
        console.error('   - Pastikan MySQL service sudah running');
        console.error('   - Cek konfigurasi DB_HOST, DB_USER, DB_PASSWORD di .env');
        console.error('   - Default port MySQL: 3306\n');
        process.exit(1);
      }
      
      console.log('✅ Connected to MySQL\n');

      // Step 2: Create database if not exists
      console.log('2️⃣  Creating database if not exists...');
      connection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``,
        (err, results) => {
          if (err) {
            console.error('❌ Error creating database:', err.message);
            connection.end();
            process.exit(1);
          }
          console.log(`✅ Database '${DB_NAME}' ready\n`);

          // Step 3: Create tables
          console.log('3️⃣  Creating tables...');
          createTables(connection);
        }
      );
    });

  } catch (error) {
    console.error('❌ Setup Error:', error.message);
    process.exit(1);
  }
}

function createTables(connection) {
  // Baca SQL dump file
  const sqlFilePath = path.join(__dirname, 'database', 'beauty_clinic.sql');
  
  if (fs.existsSync(sqlFilePath)) {
    console.log(`   📁 Reading SQL file: ${sqlFilePath}`);
    let sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Switch to correct database
    sql = `USE \`${DB_NAME}\`;\n` + sql;

    // Smart SQL statement parsing
    const statements = parseSQL(sql);
    
    console.log(`   📊 Found ${statements.length} SQL statements`);

    let completed = 0;
    const total = statements.length;

    statements.forEach((statement, index) => {
      if (statement.trim().length === 0) {
        completed++;
        return;
      }

      connection.query(statement, (err) => {
        if (err) {
          console.error(`   ❌ Error at statement ${index + 1}:`, err.message.substring(0, 100));
        }
        completed++;
        
        // Show progress
        if (completed % 5 === 0 || completed === total) {
          console.log(`   ⏳ Progress: ${completed}/${total} statements`);
        }
        
        if (completed === total) {
          console.log(`✅ All tables created (${total} statements)\n`);
          finishSetup(connection);
        }
      });
    });

    // If no statements found
    if (total === 0) {
      console.log('   ⚠️  No SQL statements found in file');
      finishSetup(connection);
    }
  } else {
    console.log(`   ⚠️  SQL file not found: ${sqlFilePath}`);
    console.log('   Trying to create basic tables...\n');
    createBasicTables(connection);
  }
}

/**
 * Smart SQL parser yang handle base64 data dan string literals
 */
function parseSQL(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let i = 0;

  while (i < sql.length) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    // Handle string literals
    if ((char === '"' || char === "'") && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    // Handle statement terminator
    if (char === ';' && !inString) {
      current += char;
      const statement = current
        .trim()
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--') && !trimmed.startsWith('/*');
        })
        .join('\n');
      
      if (statement.length > 0) {
        statements.push(statement);
      }
      current = '';
      i++;
      continue;
    }

    current += char;
    i++;
  }

  // Add any remaining statement
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }

  return statements;
}

function createBasicTables(connection) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.admin_users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100),
      role ENUM('admin', 'staff') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.members (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255),
      phone VARCHAR(20),
      address TEXT,
      join_date VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS \`${DB_NAME}\`.treatments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2),
      duration INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  let completed = 0;
  tables.forEach((table) => {
    connection.query(table, (err) => {
      completed++;
      if (err) {
        console.error('   ❌ Error:', err.message);
      }
      if (completed === tables.length) {
        console.log(`✅ Basic tables created\n`);
        finishSetup(connection);
      }
    });
  });
}

function finishSetup(connection) {
  console.log('4️⃣  Verifying setup...');
  
  connection.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
    [DB_NAME],
    (err, results) => {
      if (err) {
        console.error('❌ Error verifying tables:', err.message);
      } else {
        console.log(`✅ Found ${results.length} tables:\n`);
        results.forEach((row, i) => {
          console.log(`   ${i + 1}. ${row.TABLE_NAME}`);
        });
      }

      connection.end(() => {
        console.log('\n✅ Database setup complete!\n');
        console.log('🚀 Next: Run "npm run dev" to start the server');
        process.exit(0);
      });
    }
  );
}

setupDatabase();
