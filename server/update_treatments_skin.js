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

async function updateTreatmentsWithSkinInfo() {
  try {
    console.log("=== UPDATING TREATMENTS WITH SKIN TYPE AND CONDITION ===\n");
    
    // Map treatments based on their names and characteristics
    const updates = [
      // Hydrating/Moisture treatments - suitable for Kering (Dry)
      { name: "Facial Micro Diamond", skin_type: "Kombinasi", skin_condition: null },
      { name: "Faical Detox", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "Faical Oil Control", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "Faical Whitening", skin_type: "Kombinasi", skin_condition: null },
      { name: "Faical Acne", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "Facial Gold", skin_type: "Kombinasi", skin_condition: null },
      { name: "Facial Peeling Ultimate", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "Facial Mesotheraphy Non Needle", skin_type: "Kering", skin_condition: null },
      { name: "Facial RF Whitening Wajah", skin_type: "Kombinasi", skin_condition: null },
      // Bundling treatments
      { name: "Facial Micro + Serum Ultimate", skin_type: "Kering", skin_condition: null },
      { name: "Faical Micro + Mesotherapy NN", skin_type: "Kering", skin_condition: null },
      { name: "Faical Detox + Peeling Ultimate", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "Faical Ultimate Acne Removal", skin_type: "Berminyak", skin_condition: "acne" },
      { name: "Faical RF Whitening Wajah + Mesotherapy Non Needle", skin_type: "Kombinasi", skin_condition: null },
      // Ultimate treatments
      { name: "Faical Oxygeneo Glow", skin_type: "Kombinasi", skin_condition: null },
      { name: "Faical Scar/ Bopeng Skin", skin_type: "Kombinasi", skin_condition: "scars" },
      { name: "Faical Ultimate DNA Salmon (FLEK)", skin_type: "Kombinasi", skin_condition: "pigmentation" }
    ];
    
    let successCount = 0;
    let notFoundCount = 0;
    
    for (const update of updates) {
      const query = `UPDATE treatments SET skin_type = ?, skin_condition = ? WHERE name = ?`;
      const [result] = await promisePool.query(query, [update.skin_type, update.skin_condition, update.name]);
      if (result.affectedRows > 0) {
        console.log(`? ${update.name}`);
        console.log(`  ? skin_type: ${update.skin_type}, skin_condition: ${update.skin_condition || "None"}`);
        successCount++;
      } else {
        console.log(`? Not found: ${update.name}`);
        notFoundCount++;
      }
    }
    
    console.log(`\nUpdate Summary: ${successCount} updated, ${notFoundCount} not found`);
    
    // Verification
    console.log("\n=== FINAL VERIFICATION ===\n");
    const [records] = await promisePool.query(
      "SELECT id, name, category, skin_type, skin_condition, price FROM treatments ORDER BY id"
    );
    
    console.log("Total treatments: " + records.length);
    console.log("\nTreatments with skin type/condition:");
    records.forEach((record) => {
      if (record.skin_type || record.skin_condition) {
        console.log(`\n${record.name}`);
        console.log(`  Skin Type: ${record.skin_type}`);
        console.log(`  Skin Condition: ${record.skin_condition || "N/A"}`);
      }
    });
    
    console.log("\n=== MIGRATION COMPLETED ===");
    
  } catch (error) {
    console.error("? Error:", error.message);
    process.exit(1);
  } finally {
    await promisePool.end();
    process.exit(0);
  }
}

updateTreatmentsWithSkinInfo();
