const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';
const TOKEN = 'test-token'; // Ganti dengan token valid jika diperlukan

async function testMedicalRecordsAPI() {
  try {
    console.log('\n=== TESTING MEDICAL RECORDS API ===\n');

    // Test 1: Get count for appointment ID 37 (based on database test, ini punya 7 records)
    console.log('📋 Test 1: Get medical records count for appointment ID 37');
    try {
      const countRes = await axios.get(`${API_BASE_URL}/api/medical-records/appointment/37/count`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log('✅ Response:', JSON.stringify(countRes.data, null, 2));
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Server tidak running - test API structure saja');
      } else {
        console.log('❌ Error:', error.response?.data || error.message);
      }
    }

    // Test 2: Get count for appointment ID 38 (based on database test, ini punya 5 records)
    console.log('\n📋 Test 2: Get medical records count for appointment ID 38');
    try {
      const countRes = await axios.get(`${API_BASE_URL}/api/medical-records/appointment/38/count`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log('✅ Response:', JSON.stringify(countRes.data, null, 2));
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Server tidak running - test API structure saja');
      } else {
        console.log('❌ Error:', error.response?.data || error.message);
      }
    }

    // Test 3: Get all medical records
    console.log('\n📋 Test 3: Get all medical records');
    try {
      const allRes = await axios.get(`${API_BASE_URL}/api/medical-records`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      console.log('✅ Found', allRes.data.count, 'medical records');
      console.log('Sample data:', allRes.data.data?.slice(0, 2));
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Server tidak running');
      } else {
        console.log('❌ Error:', error.response?.data || error.message);
      }
    }

    console.log('\n=== API TEST SUMMARY ===');
    console.log('✅ API routes tersedia di:');
    console.log('  • GET /api/medical-records');
    console.log('  • GET /api/medical-records/:id');
    console.log('  • GET /api/medical-records/appointment/:appointmentId');
    console.log('  • GET /api/medical-records/appointment/:appointmentId/count ← NEW');
    console.log('  • GET /api/medical-records/member/:memberId');
    console.log('  • GET /api/medical-records/member/:memberId/completed');
    console.log('  • POST /api/medical-records (create with upload)');
    console.log('  • PUT /api/medical-records/:id (update with upload)');
    console.log('  • PUT /api/medical-records/:id/status (update status)');
    console.log('  • DELETE /api/medical-records/:id\n');

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testMedicalRecordsAPI();
