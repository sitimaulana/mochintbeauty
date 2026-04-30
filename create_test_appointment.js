/**
 * Test Appointment Creation Script
 * Create appointment untuk test reminder feature
 */

const { promisePool } = require('./server/config/database');

async function createTestAppointment() {
  try {
    console.log('🧪 Creating test appointment...\n');

    // Get current date and time
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Create appointment 1 hour from now
    const appointmentTime = new Date(now.getTime() + 60 * 60 * 1000);
    const hours = String(appointmentTime.getHours()).padStart(2, '0');
    const minutes = String(appointmentTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    console.log(`📅 Appointment Details:`);
    console.log(`   Date: ${today}`);
    console.log(`   Time: ${timeStr} (1 hour from now)`);
    console.log(`   Status: confirmed`);
    console.log(`   Reminder: not sent yet\n`);

    const [result] = await promisePool.query(`
      INSERT INTO appointments 
      (appointment_id, member_id, customer_name, treatment_id, date, time, amount, status, reminder_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'APT99999',           // appointment_id
      1,                    // member_id (existing member)
      'Test User',          // customer_name
      1,                    // treatment_id (facial treatment)
      today,                // date
      timeStr,              // time (1 hour from now)
      300000,               // amount (300k)
      'confirmed',          // status
      0                     // reminder_sent (false)
    ]);

    console.log(`✅ Test appointment created successfully!`);
    console.log(`   Appointment ID: APT99999`);
    console.log(`   Database ID: ${result.insertId}`);
    console.log(`\n📧 What happens next:`);
    console.log(`   1. Reminder Service checks every 10 minutes`);
    console.log(`   2. When time gets within 2 hours of appointment`);
    console.log(`   3. Email reminder will be sent automatically`);
    console.log(`   4. Check server console for: "✅ Reminder email sent"`);
    console.log(`\n⏱️  Expected reminder at: ${new Date(appointmentTime.getTime() - 90 * 60 * 1000).toLocaleTimeString()}`);
    console.log(`   (90 minutes from now, which is 1.5 hours before appointment)\n`);

    // Get appointment details
    const [appointments] = await promisePool.query(`
      SELECT 
        a.*, 
        m.name, m.email,
        t.name as treatment_name
      FROM appointments a
      LEFT JOIN members m ON a.member_id = m.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      WHERE a.appointment_id = 'APT99999'
    `);

    if (appointments.length > 0) {
      const apt = appointments[0];
      console.log(`📋 Appointment Details:`);
      console.log(`   No: ${apt.appointment_id}`);
      console.log(`   Customer: ${apt.customer_name}`);
      console.log(`   Email: ${apt.email}`);
      console.log(`   Treatment: ${apt.treatment_name}`);
      console.log(`   Date/Time: ${apt.date} ${apt.time}`);
      console.log(`   Amount: Rp ${apt.amount.toLocaleString('id-ID')}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Reminder Sent: ${apt.reminder_sent ? 'Yes' : 'No'}\n`);
    }

    console.log(`🎯 Next Steps:`);
    console.log(`   1. Check server console for reminder logs`);
    console.log(`   2. Wait ~90 minutes for reminder (or modify time in DB)`);
    console.log(`   3. Or use API to send manually:`);
    console.log(`      POST /api/reminders/{appointmentId}/send`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test appointment:', error.message);
    process.exit(1);
  }
}

createTestAppointment();
