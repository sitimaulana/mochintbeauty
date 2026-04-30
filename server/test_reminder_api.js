/**
 * Test Reminder API - Manually Trigger Reminder Send
 * 
 * This script will:
 * 1. Get the JWT token (admin login)
 * 2. Manually trigger reminder send for APT99999
 * 3. Check the response and database status
 */

const http = require('http');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Helper to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testReminderAPI() {
  console.log('\n📧 Testing Reminder API Manually...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣  Logging in to get JWT token...');
    
    // Get admin user from database
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'beauty_clinic'
    });

    const [admins] = await conn.query('SELECT email FROM admin_users LIMIT 1');
    conn.end();

    if (admins.length === 0) {
      console.error('❌ No admin users found in database');
      process.exit(1);
    }

    const adminEmail = admins[0].email;
    console.log('   Using admin email:', adminEmail);

    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: adminEmail,
      password: 'admin123'
    });

    if (loginRes.status !== 200) {
      console.error('❌ Login failed:', loginRes.data);
      process.exit(1);
    }

    const token = loginRes.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Check pending reminders
    console.log('2️⃣  Checking pending reminders...');
    const pendingRes = await makeRequest('GET', '/api/reminders/pending', null, token);
    console.log('   Pending reminders:', pendingRes.data?.data?.length || 0);

    // Step 3: Manually trigger reminder for APT99999
    console.log('\n3️⃣  Manually triggering reminder send for APT99999...');
    const sendRes = await makeRequest('POST', '/api/reminders/APT99999/send', {}, token);
    
    if (sendRes.status === 200 || sendRes.status === 201) {
      console.log('✅ Reminder send triggered successfully!');
      console.log('   Response:', sendRes.data);
    } else {
      console.log('⚠️  Response status:', sendRes.status);
      console.log('   Response:', sendRes.data);
    }

    // Step 4: Check reminder status
    console.log('\n4️⃣  Checking appointment reminder status...');
    const statusRes = await makeRequest('GET', '/api/reminders/APT99999/status', null, token);
    
    if (statusRes.data) {
      console.log('✅ Reminder Status:');
      console.log('   ID:', statusRes.data.appointment_id);
      console.log('   Status:', statusRes.data.status);
      console.log('   Sent:', statusRes.data.reminder_sent);
      console.log('   Sent At:', statusRes.data.reminder_sent_at);
    }

    // Step 5: Check database directly
    console.log('\n5️⃣  Verifying in database...');
    const dbConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'beauty_clinic'
    });

    const [apt] = await dbConn.query(
      'SELECT appointment_id, reminder_sent, reminder_sent_at FROM appointments WHERE appointment_id = ?',
      ['APT99999']
    );

    if (apt.length > 0) {
      console.log('✅ Appointment found in database:');
      console.log('   Appointment ID:', apt[0].appointment_id);
      console.log('   Reminder Sent:', apt[0].reminder_sent ? 'YES' : 'NO');
      console.log('   Sent At:', apt[0].reminder_sent_at || 'N/A');
    } else {
      console.log('❌ Appointment not found');
    }

    dbConn.end();

    console.log('\n✅ Test complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testReminderAPI().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
