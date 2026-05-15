const { promisePool } = require('./config/database');

async function testMedicalRecords() {
  try {
    console.log('\n=== MEDICAL RECORDS DATABASE TEST ===\n');

    // 1. Check table structure
    console.log('📋 Table Structure:');
    const [columns] = await promisePool.query('DESCRIBE medical_records');
    columns.forEach(col => {
      console.log(`  • ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });

    // 2. Check data count
    console.log('\n📊 Data Count:');
    const [countResult] = await promisePool.query('SELECT COUNT(*) as count FROM medical_records');
    console.log(`  Total records: ${countResult[0].count}`);

    // 3. Check appointments table
    console.log('\n📋 Appointments Check:');
    const [apptCount] = await promisePool.query('SELECT COUNT(*) as count FROM appointments');
    console.log(`  Total appointments: ${apptCount[0].count}`);

    // 4. Show sample data if exists
    if (countResult[0].count > 0) {
      console.log('\n📄 Sample Medical Records:');
      const [records] = await promisePool.query(`
        SELECT 
          mr.id,
          mr.appointment_id,
          mr.member_id,
          mr.treatment_name,
          mr.status,
          mr.before_image_url,
          mr.created_at
        FROM medical_records mr
        ORDER BY mr.created_at DESC
        LIMIT 5
      `);
      
      records.forEach(rec => {
        console.log(`  • ID: ${rec.id} | Apt: ${rec.appointment_id} | Member: ${rec.member_id} | Status: ${rec.status}`);
        console.log(`    Treatment: ${rec.treatment_name} | Image: ${rec.before_image_url ? '✓ Yes' : '✗ No'}`);
        console.log(`    Created: ${rec.created_at}`);
      });
    } else {
      console.log('  ⚠️ No medical records yet');
    }

    // 5. Check appointments WITH medical records
    console.log('\n🔗 Appointments with Medical Records:');
    const [linkedAppts] = await promisePool.query(`
      SELECT DISTINCT 
        a.id,
        a.appointment_id,
        a.customer_name,
        a.date,
        a.status,
        COUNT(mr.id) as medical_record_count
      FROM appointments a
      LEFT JOIN medical_records mr ON a.id = mr.appointment_id
      GROUP BY a.id
      HAVING COUNT(mr.id) > 0
      LIMIT 10
    `);

    if (linkedAppts.length > 0) {
      linkedAppts.forEach(apt => {
        console.log(`  • Apt ${apt.appointment_id} (${apt.customer_name}): ${apt.medical_record_count} record(s)`);
      });
    } else {
      console.log('  ⚠️ No appointments with medical records linked yet');
    }

    console.log('\n✅ Database test completed\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

testMedicalRecords();
