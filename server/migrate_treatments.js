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

async function migrateTreatments() {
  try {
    console.log("=== STARTING TREATMENT TABLE MIGRATION ===\n");
    
    // Step 1: Add columns if they don't exist
    console.log("Step 1: Adding columns (skin_type, skin_condition)...");
    try {
      await promisePool.query(
        `ALTER TABLE treatments ADD COLUMN skin_type VARCHAR(50) DEFAULT NULL`
      );
      console.log("? skin_type column added");
    } catch (err) {
      if (err.message.includes("Duplicate")) {
        console.log("? skin_type column already exists");
      } else {
        throw err;
      }
    }
    
    try {
      await promisePool.query(
        `ALTER TABLE treatments ADD COLUMN skin_condition VARCHAR(100) DEFAULT NULL`
      );
      console.log("? skin_condition column added");
    } catch (err) {
      if (err.message.includes("Duplicate")) {
        console.log("? skin_condition column already exists");
      } else {
        throw err;
      }
    }
    
    // Step 2: Update treatments with skin_type and skin_condition mappings
    console.log("\nStep 2: Updating treatments with skin_type and skin_condition...");
    
    const updates = [
      { name: "Hydrating Facial", skin_type: "Kering", skin_condition: null },
      { name: "Moisture Mask Treatment", skin_type: "Kering", skin_condition: null },
      { name: "Oil Massage Therapy", skin_type: "Kering", skin_condition: null },
      { name: "Deep Cleansing Facial", skin_type: "Berminyak", skin_condition: null },
      { name: "Chemical Peel", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "HydraFacial", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "Balanced Facial", skin_type: "Kombinasi", skin_condition: null },
      { name: "Multi-Zone Treatment", skin_type: "Kombinasi", skin_condition: null }
    ];
    
    for (const update of updates) {
      const query = `UPDATE treatments SET skin_type = ?, skin_condition = ? WHERE name = ?`;
      const [result] = await promisePool.query(query, [update.skin_type, update.skin_condition, update.name]);
      if (result.affectedRows > 0) {
        console.log(`? Updated: ${update.name} (${update.skin_type}${update.skin_condition ? ", " + update.skin_condition : ""})`);
      } else {
        console.log(`? Not found: ${update.name}`);
      }
    }
    
    // Step 3: Verify changes
    console.log("\n=== VERIFICATION: TREATMENTS WITH SKIN_TYPE AND CONDITION ===\n");
    const [records] = await promisePool.query(
      "SELECT id, name, category, skin_type, skin_condition, price FROM treatments ORDER BY id"
    );
    
    records.forEach((record, index) => {
      console.log(`${index + 1}. ${record.name}`);
      console.log(`   Category: ${record.category}`);
      console.log(`   Skin Type: ${record.skin_type || "N/A"}`);
      console.log(`   Skin Condition: ${record.skin_condition || "N/A"}`);
      console.log(`   Price: Rp ${record.price}`);
      console.log("");
    });
    
    console.log("=== MIGRATION COMPLETED SUCCESSFULLY ===");
    
  } catch (error) {
    console.error("? Error:", error.message);
    process.exit(1);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

migrateTreatments();
