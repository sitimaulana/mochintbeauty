#!/usr/bin/env node

/**
 * Simple Database Setup Script
 * Menggunakan child_process untuk jalankan mysql command langsung
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'beauty_clinic';
const DB_PORT = process.env.DB_PORT || 3306;

console.log('🚀 Mochint Beauty Database Setup (Simple Method)\n');
console.log('📋 Configuration:');
console.log(`   Host: ${DB_HOST}:${DB_PORT}`);
console.log(`   User: ${DB_USER}`);
console.log(`   Database: ${DB_NAME}\n`);

async function setupDatabase() {
  try {
    // Step 1: Test connection
    console.log('1️⃣  Testing MySQL connection...');
    try {
      const testCmd = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} -e "SELECT 1" 2>&1`;
      execSync(testCmd, { stdio: 'pipe' });
      console.log('✅ MySQL connection successful\n');
    } catch (err) {
      console.error('❌ Cannot connect to MySQL');
      console.error('   Make sure MySQL is running and credentials are correct\n');
      console.error('   Error:', err.message);
      process.exit(1);
    }

    // Step 2: Create database
    console.log('2️⃣  Creating database if not exists...');
    try {
      const dbCmd = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} -e "CREATE DATABASE IF NOT EXISTS \\\`${DB_NAME}\\\`;" 2>&1`;
      execSync(dbCmd, { stdio: 'pipe' });
      console.log(`✅ Database '${DB_NAME}' ready\n`);
    } catch (err) {
      console.error('❌ Error creating database:', err.message);
      process.exit(1);
    }

    // Step 3: Import SQL dump
    console.log('3️⃣  Importing database schema...');
    const sqlFilePath = path.join(__dirname, 'database', 'beauty_clinic.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ SQL file not found: ${sqlFilePath}`);
      process.exit(1);
    }

    try {
      // Use mysql < file method which is more reliable
      const importCmd = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} < "${sqlFilePath}" 2>&1`;
      
      console.log('   Running import command...');
      const output = execSync(importCmd, { encoding: 'utf8' });
      
      if (output && output.includes('Error')) {
        console.warn('⚠️  Warnings:', output);
      } else {
        console.log('✅ Schema imported successfully\n');
      }
    } catch (err) {
      console.error('❌ Error importing schema:', err.message);
      // Don't exit, might have warnings
    }

    // Step 4: Verify
    console.log('4️⃣  Verifying setup...');
    try {
      const verifyCmd = `mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} -e "SHOW TABLES;" 2>&1`;
      const tables = execSync(verifyCmd, { encoding: 'utf8' });
      
      const tableList = tables.split('\n').filter(line => line.trim() && line !== 'Tables_in_beauty_clinic');
      console.log(`✅ Found ${tableList.length} tables:\n`);
      
      tableList.forEach((table, i) => {
        if (table.trim()) {
          console.log(`   ${i + 1}. ${table.trim()}`);
        }
      });
    } catch (err) {
      console.error('⚠️  Could not verify tables:', err.message);
    }

    console.log('\n✅ Database setup complete!\n');
    console.log('🚀 Next steps:');
    console.log('   1. npm run dev (start backend server)');
    console.log('   2. In another terminal: cd .. && npm run dev (start frontend)\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
