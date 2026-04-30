/**
 * Setup Reminder Feature
 * Run this script to setup reminder columns di database
 * 
 * Usage: node setup_reminder_feature.js
 */

const { promisePool } = require('./config/database');

async function setupReminderFeature() {
  console.log('\n🔔 Setting up Appointment Reminder Feature...\n');

  try {
    console.log('1️⃣  Adding reminder columns to appointments table...');
    
    // Check if columns exist first
    const [existingColumns] = await promisePool.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'appointments' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME IN ('reminder_sent', 'reminder_sent_at', 'reminder_hours_before')
    `);

    const existingColNames = existingColumns.map(col => col.COLUMN_NAME);

    // Add columns one by one if they don't exist
    if (!existingColNames.includes('reminder_sent')) {
      await promisePool.query(`
        ALTER TABLE appointments
        ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE
      `);
      console.log('   ✅ reminder_sent column added');
    } else {
      console.log('   ⚠️  reminder_sent column already exists');
    }

    if (!existingColNames.includes('reminder_sent_at')) {
      await promisePool.query(`
        ALTER TABLE appointments
        ADD COLUMN reminder_sent_at TIMESTAMP NULL
      `);
      console.log('   ✅ reminder_sent_at column added');
    } else {
      console.log('   ⚠️  reminder_sent_at column already exists');
    }

    if (!existingColNames.includes('reminder_hours_before')) {
      await promisePool.query(`
        ALTER TABLE appointments
        ADD COLUMN reminder_hours_before INT DEFAULT 2
      `);
      console.log('   ✅ reminder_hours_before column added');
    } else {
      console.log('   ⚠️  reminder_hours_before column already exists');
    }

    console.log('   ✅ All reminder columns processed successfully');

    console.log('\n2️⃣  Creating indexes for better performance...');
    
    // Check if indexes exist
    const [existingIndexes] = await promisePool.query(`
      SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_NAME = 'appointments' 
      AND TABLE_SCHEMA = DATABASE()
      AND INDEX_NAME IN ('idx_reminder_status', 'idx_appointment_datetime')
    `);

    const existingIndexNames = existingIndexes.map(idx => idx.INDEX_NAME);

    // Create indexes if they don't exist
    if (!existingIndexNames.includes('idx_reminder_status')) {
      try {
        await promisePool.query(`
          CREATE INDEX idx_reminder_status 
          ON appointments(reminder_sent, status)
        `);
        console.log('   ✅ Index idx_reminder_status created');
      } catch (err) {
        console.log('   ⚠️  idx_reminder_status already exists or error:', err.message.slice(0, 50));
      }
    } else {
      console.log('   ⚠️  Index idx_reminder_status already exists');
    }

    if (!existingIndexNames.includes('idx_appointment_datetime')) {
      try {
        await promisePool.query(`
          CREATE INDEX idx_appointment_datetime 
          ON appointments(date, time)
        `);
        console.log('   ✅ Index idx_appointment_datetime created');
      } catch (err) {
        console.log('   ⚠️  idx_appointment_datetime already exists or error:', err.message.slice(0, 50));
      }
    } else {
      console.log('   ⚠️  Index idx_appointment_datetime already exists');
    }

    console.log('\n3️⃣  Verifying table structure...');
    
    // Verify structure
    const [columns] = await promisePool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'appointments' 
      AND COLUMN_NAME IN ('reminder_sent', 'reminder_sent_at', 'reminder_hours_before')
    `);

    if (columns.length === 3) {
      console.log('   ✅ All reminder columns verified:');
      columns.forEach(col => {
        console.log(`      - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`);
      });
    } else {
      console.warn('   ⚠️  Some columns might not exist');
    }

    console.log('\n4️⃣  Checking current appointments...');
    
    const [stats] = await promisePool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN reminder_sent = TRUE THEN 1 ELSE 0 END) as with_reminders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
      FROM appointments
    `);

    console.log(`   Total appointments: ${stats[0].total}`);
    console.log(`   With reminders sent: ${stats[0].with_reminders || 0}`);
    console.log(`   Confirmed status: ${stats[0].confirmed || 0}`);

    console.log('\n✅ Reminder Feature Setup Complete!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Update .env with reminder settings:');
    console.log('      - REMINDER_HOURS_BEFORE=2');
    console.log('      - REMINDER_CHECK_INTERVAL=10');
    console.log('      - REMINDER_SERVICE_ENABLED=true');
    console.log('\n   2. Ensure EMAIL_USER and EMAIL_PASSWORD are configured');
    console.log('\n   3. Restart server: npm run dev');
    console.log('\n   4. Check console for: "✅ Reminder Service started"\n');

  } catch (error) {
    console.error('\n❌ Error setting up reminder feature:', error.message);
    console.error('Error details:', error.sql || error.code || '');
    process.exit(1);
  } finally {
    await promisePool.end();
  }
}

// Run setup
if (process.argv.includes('--test')) {
  setupReminderFeature().then(() => {
    console.log('\n\n');
    return createTestAppointment();
  }).then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
} else {
  setupReminderFeature().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

/**
 * Helper: Create test appointment
 */
async function createTestAppointment() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const appointmentTime = new Date(now.getTime() + 60 * 60 * 1000);
    const hours = String(appointmentTime.getHours()).padStart(2, '0');
    const minutes = String(appointmentTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const [result] = await promisePool.query(`
      INSERT INTO appointments 
      (appointment_id, member_id, customer_name, treatment_id, date, time, amount, status, reminder_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['APT99999', 1, 'Test Reminder', 10, today, timeStr, 300000, 'confirmed', 0]);

    console.log('\n✅ Test appointment created successfully!\n');
    console.log('📅 Appointment Details:');
    console.log('   Appointment ID: APT99999');
    console.log('   Date: ' + today);
    console.log('   Time: ' + timeStr + ' (1 hour from now)');
    console.log('   Treatment: Facial Micro Diamond');
    console.log('   Amount: Rp 300.000');
    console.log('   Status: confirmed');
    console.log('   Reminder: not sent yet');
    console.log('\n⏰ Expected Behavior:');
    console.log('   • Reminder Service checks every 10 minutes');
    console.log('   • When time is within 2 hours of appointment');
    console.log('   • Email reminder will be sent automatically');
    console.log('   • Check server console for: "✅ Reminder email sent"');
    console.log('\n📧 Email will be sent to member with ID 1');
  } catch (error) {
    console.error('❌ Error creating test appointment:', error.message);
  }
}
