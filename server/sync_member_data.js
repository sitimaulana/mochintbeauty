/**
 * Script untuk Sinkronkan Data Member dengan Appointments
 * 
 * Tujuan: Memastikan total_visits dan last_visit di Member table sesuai dengan data di Appointments table
 * 
 * Gunakan: node sync_member_data.js
 */

require('dotenv').config();
const { promisePool } = require('./config/database');
const Member = require('./models/Member');

async function syncAllMembers() {
  console.log('🚀 Starting member sync process...\n');
  
  try {
    // Ambil semua members
    const [allMembers] = await promisePool.query('SELECT id, name FROM members');
    
    if (allMembers.length === 0) {
      console.log('ℹ️  Tidak ada member untuk disinkronkan');
      process.exit(0);
    }
    
    console.log(`📊 Ditemukan ${allMembers.length} members\n`);
    
    let syncedCount = 0;
    let totalVisits = 0;
    const results = [];
    
    // Loop setiap member
    for (let i = 0; i < allMembers.length; i++) {
      const member = allMembers[i];
      
      try {
        // Query untuk mendapatkan completed appointments
        const [completedAppointments] = await promisePool.query(
          `SELECT 
            id, 
            date, 
            time,
            treatment_id,
            therapist_id,
            amount,
            status
          FROM appointments 
          WHERE member_id = ? AND status = 'completed'
          ORDER BY date DESC`,
          [member.id]
        );
        
        const visits = completedAppointments.length;
        const lastVisit = completedAppointments.length > 0 
          ? completedAppointments[0].date 
          : 'Belum Pernah';
        
        // Update member di database
        await Member.update(member.id, {
          total_visits: visits,
          last_visit: lastVisit
        });
        
        syncedCount++;
        totalVisits += visits;
        
        results.push({
          member_id: member.id,
          member_name: member.name,
          total_visits: visits,
          last_visit: lastVisit,
          appointment_count: completedAppointments.length
        });
        
        // Progress indicator
        console.log(`[${i + 1}/${allMembers.length}] ✅ ${member.name}: ${visits} kunjungan (terakhir: ${lastVisit})`);
        
      } catch (err) {
        console.error(`[${i + 1}/${allMembers.length}] ❌ Error syncing member ${member.id} (${member.name}):`, err.message);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📈 RINGKASAN SINKRONISASI');
    console.log('='.repeat(70));
    console.log(`✅ Total members tersinkronkan: ${syncedCount}/${allMembers.length}`);
    console.log(`📊 Total kunjungan selesai: ${totalVisits}`);
    console.log('='.repeat(70));
    
    // Tampilkan top 10 members dengan kunjungan terbanyak
    if (results.length > 0) {
      console.log('\n🏆 TOP 10 MEMBERS DENGAN KUNJUNGAN TERBANYAK:');
      console.log('-'.repeat(70));
      
      const sortedResults = [...results]
        .sort((a, b) => b.total_visits - a.total_visits)
        .slice(0, 10);
      
      sortedResults.forEach((r, idx) => {
        console.log(`${idx + 1}. ${r.member_name.padEnd(20)} - ${r.total_visits} kunjungan (terakhir: ${r.last_visit})`);
      });
      
      console.log('-'.repeat(70));
    }
    
    console.log('\n✨ Sinkronisasi selesai!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Jalankan script
syncAllMembers();
