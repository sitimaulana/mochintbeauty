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

async function showTreatmentsData() {
  try {
    console.log("=== TREATMENTS DATA ===\n");
    const [records] = await promisePool.query(
      "SELECT id, name, category, price FROM treatments ORDER BY id LIMIT 15"
    );
    
    console.log(`Total records shown: ${records.length}\n`);
    records.forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  Name: ${record.name}`);
      console.log(`  Category: ${record.category}`);
      console.log(`  Category Type: ${typeof record.category}`);
      console.log(`  Price: ${record.price}`);
      console.log("");
    });
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

showTreatmentsData();
