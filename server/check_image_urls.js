const { promisePool } = require('./config/database');

async function checkImageURLs() {
  try {
    console.log('\n=== CHECKING IMAGE URLS IN DATABASE ===\n');

    // Get medical records dengan image URLs
    const [records] = await promisePool.query(`
      SELECT 
        id,
        appointment_id,
        treatment_name,
        before_image_url,
        after_image_url,
        status,
        created_at
      FROM medical_records
      WHERE before_image_url IS NOT NULL OR after_image_url IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`📊 Found ${records.length} medical records with images\n`);

    records.forEach((record, index) => {
      console.log(`${index + 1}. Medical Record ID: ${record.id}`);
      console.log(`   Appointment: ${record.appointment_id}`);
      console.log(`   Treatment: ${record.treatment_name}`);
      console.log(`   Status: ${record.status}`);
      console.log(`   Before Image URL: ${record.before_image_url || 'NULL'}`);
      console.log(`   After Image URL: ${record.after_image_url || 'NULL'}`);
      console.log(`   Created: ${record.created_at}\n`);
    });

    // Check for records WITHOUT images but should have them
    const [emptyRecords] = await promisePool.query(`
      SELECT 
        id,
        appointment_id,
        treatment_name,
        status,
        created_at
      FROM medical_records
      WHERE before_image_url IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (emptyRecords.length > 0) {
      console.log(`⚠️ Found ${emptyRecords.length} records WITHOUT before_image_url:\n`);
      emptyRecords.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id} | Apt: ${record.appointment_id} | Status: ${record.status}`);
      });
    }

    console.log('\n✅ Database check completed\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkImageURLs();
