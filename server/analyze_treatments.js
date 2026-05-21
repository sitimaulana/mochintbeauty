const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "beauty_clinic",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

async function analyzeTreatments() {
  try {
    console.log("=== TREATMENTS TABLE ANALYSIS ===\n");
    
    // Show all columns
    const [columns] = await promisePool.query(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'treatments' ORDER BY ORDINAL_POSITION`
    );
    
    console.log("TABLE STRUCTURE:");
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    // Show sample records with category details
    console.log("\n=== SAMPLE TREATMENTS (FIRST 12 RECORDS) ===\n");
    const [records] = await promisePool.query(
      "SELECT id, name, category, description, price FROM treatments ORDER BY id LIMIT 12"
    );
    
    records.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   Name: ${record.name}`);
      console.log(`   Category: ${record.category}`);
      console.log(`   Description: ${record.description ? record.description.substring(0, 80) : "N/A"}`);
      console.log(`   Price: Rp ${record.price}`);
      console.log("");
    });
    
    // Check unique categories
    const [uniqueCategories] = await promisePool.query(
      "SELECT DISTINCT category FROM treatments"
    );
    console.log("UNIQUE CATEGORIES:");
    uniqueCategories.forEach(cat => {
      console.log(`  ${cat.category}`);
    });
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

analyzeTreatments();
