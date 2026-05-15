const { promisePool } = require('./config/database');

async function cleanupInvalidRecords() {
  try {
    console.log('\n=== CLEANING UP INVALID MEDICAL RECORDS ===\n');

    // Find records with very small image sizes or missing files
    const [records] = await promisePool.query(`
      SELECT 
        id,
        appointment_id,
        before_image_url,
        after_image_url,
        status
      FROM medical_records
      WHERE before_image_url IS NOT NULL OR after_image_url IS NOT NULL
      ORDER BY created_at DESC
    `);

    console.log(`📊 Found ${records.length} medical records with images\n`);

    // Note: We'll NOT delete records, just update them to have NULL image URLs
    // This preserves the medical record data but removes reference to bad images
    
    let updateCount = 0;
    for (const record of records) {
      // Example: if image URL ends with old invalid files, set to NULL
      const isBefore = record.before_image_url?.includes('ultimtae') || 
                       record.before_image_url?.includes('single treatment') ||
                       record.before_image_url?.includes('beauty treatment');
      const isAfter = record.after_image_url?.includes('ultimtae') || 
                      record.after_image_url?.includes('single treatment') ||
                      record.after_image_url?.includes('beauty treatment');

      if (isBefore || isAfter) {
        console.log(`⚠️  Record ${record.id}:`);
        if (isBefore) {
          console.log(`    Clearing before_image_url: ${record.before_image_url}`);
        }
        if (isAfter) {
          console.log(`    Clearing after_image_url: ${record.after_image_url}`);
        }

        // Update the record
        if (isBefore && isAfter) {
          await promisePool.query(
            'UPDATE medical_records SET before_image_url = NULL, after_image_url = NULL WHERE id = ?',
            [record.id]
          );
        } else if (isBefore) {
          await promisePool.query(
            'UPDATE medical_records SET before_image_url = NULL WHERE id = ?',
            [record.id]
          );
        } else if (isAfter) {
          await promisePool.query(
            'UPDATE medical_records SET after_image_url = NULL WHERE id = ?',
            [record.id]
          );
        }
        updateCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Records updated: ${updateCount}`);
    console.log(`   Records kept intact: ${records.length - updateCount}`);

    console.log('\n💡 Tip: Member can now re-upload fresh images');
    console.log('✅ Cleanup completed\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupInvalidRecords();
