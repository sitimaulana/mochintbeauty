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

async function showAllTreatmentsColumns() {
  try {
    console.log("=== FULL TREATMENTS TABLE STRUCTURE AND DATA ===\n");
    const [records] = await promisePool.query(
      "SELECT * FROM treatments LIMIT 3"
    );
    
    if (records.length > 0) {
      console.log("Available columns:");
      Object.keys(records[0]).forEach(key => {
        console.log(`  - ${key}`);
      });
      
      console.log("\n=== First 3 Complete Records ===\n");
      records.forEach((record, index) => {
        console.log(`Record ${index + 1}:`);
        console.log(JSON.stringify(record, null, 2));
        console.log("");
      });
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

showAllTreatmentsColumns();
