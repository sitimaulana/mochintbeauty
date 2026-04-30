/**
 * Create Test Appointment for Reminder Feature Testing
 * 
 * Usage: node create_test_appointment.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestAppointment() {
  console.log('\n📝 Creating test appointment...\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beauty_clinic'
  });

  try {
    // Calculate appointment time (1 hour from now)
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const appointmentTime = new Date(now.getTime() + 60 * 60 * 1000);
    const hours = String(appointmentTime.getHours()).padStart(2, '0');
    const minutes = String(appointmentTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    // Check if appointment already exists
    const [existing] = await connection.query(
      'SELECT appointment_id FROM appointments WHERE appointment_id = ?',
      ['APT99999']
    );

    if (existing.length > 0) {
      console.log('⚠️  Test appointment APT99999 already exists');
      console.log('   Deleting old test appointment...\n');
      await connection.query('DELETE FROM appointments WHERE appointment_id = ?', ['APT99999']);
    }

    // Insert test appointment (using existing member ID 260002)
    await connection.query(`
      INSERT INTO appointments 
      (appointment_id, member_id, customer_name, treatment_id, date, time, amount, status, reminder_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, ['APT99999', 260002, 'Test Reminder', 10, today, timeStr, 300000, 'confirmed', 0]);

    console.log('✅ Test appointment created successfully!\n');
    console.log('📅 Appointment Details:');
    console.log('   Appointment ID: APT99999');
    console.log('   Member ID: 260002 (jean)');
    console.log('   Date: ' + today);
    console.log('   Time: ' + timeStr + ' (1 hour from now)');
    console.log('   Treatment ID: 10 (Facial Micro Diamond)');
    console.log('   Amount: Rp 300.000');
    console.log('   Status: confirmed');
    console.log('   Reminder: not sent yet');
    console.log('\n⏰ Expected Behavior:');
    console.log('   • Reminder Service checks every 10 minutes');
    console.log('   • When appointment time is within 2 hours');
    console.log('   • Reminder email will be sent automatically');
    console.log('   • Check server console for: "✅ Reminder email sent"');
    console.log('\n📧 Email will be sent to member "jean"');
    console.log('⏳ Next check in approximately 10 minutes...\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createTestAppointment().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
