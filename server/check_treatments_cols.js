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
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

async function showTreatmentsInfo() {
  try {
    console.log("=== TABLE COLUMNS ===");
    const [columns] = await promisePool.query(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'treatments' AND TABLE_SCHEMA = DATABASE()`
    );
    
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    console.log("\n=== SAMPLE RECORDS (ID 10-12) ===");
    const [records] = await promisePool.query(
      "SELECT id, name, category, skin_type, skin_condition FROM treatments WHERE id BETWEEN 10 AND 12"
    );
    
    records.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(JSON.stringify(record, null, 2));
    });
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

showTreatmentsInfo();
