const Member = require('../models/Member');


exports.getMemberHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await Member.getHistoryById(id);
    res.json({ 
      success: true, 
      count: history.length,
      data: history 
    });
  } catch (error) {
    console.error('Error getting member history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get member history',
      message: error.message 
    });
  }
};

// Get all members
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.getAll();
    res.json({ 
      success: true, 
      count: members.length,
      data: members 
    });
  } catch (error) {
    console.error('Error getting members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get members',
      message: error.message 
    });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.getById(id);
    
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('Error getting member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get member',
      message: error.message 
    });
  }
};

// Create new member
exports.createMember = async (req, res) => {
  try {
    const memberData = req.body;
    
    // Generate ID jika tidak ada
    if (!memberData.id) {
      const lastMember = await Member.getLastId();
      const lastNumber = lastMember ? parseInt(lastMember.id.substring(1)) : 0;
      memberData.id = `M${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    // Set join date jika tidak ada
    if (!memberData.join_date) {
      memberData.join_date = new Date().toISOString().split('T')[0];
    }
    
    const result = await Member.create(memberData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Member created successfully',
      data: { id: result.id }
    });
  } catch (error) {
    console.error('Error creating member:', error);
    
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create member',
      message: error.message 
    });
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const memberData = req.body;
    
    console.log('📝 Updating member:', id);
    console.log('📦 Data to update:', memberData);
    
    const result = await Member.update(id, memberData);
    
    console.log('✅ Update result:', result);
    
    if (result.affectedRows === 0) {
      console.warn('⚠️ Member not found with ID:', id);
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    
    // Return updated member data
    const updatedMember = await Member.getById(id);
    
    console.log('✅ Member updated successfully:', updatedMember);
    
    res.json({ 
      success: true, 
      message: 'Member updated successfully',
      data: updatedMember 
    });
  } catch (error) {
    console.error('❌ Error updating member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update member',
      message: error.message 
    });
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Member.remove(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Member deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete member',
      message: error.message 
    });
  }
};

// Search members
exports.searchMembers = async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q || '';
    
    const members = await Member.search(searchTerm);
    
    res.json({ 
      success: true, 
      count: members.length,
      data: members 
    });
  } catch (error) {
    console.error('Error searching members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search members',
      message: error.message 
    });
  }
};

// Sinkronkan data member dengan appointment
exports.syncMemberWithAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔄 Syncing member:', id, 'with appointments');
    
    // Dapatkan member
    const member = await Member.getById(id);
    if (!member) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }
    
    // Ambil appointments dari database
    const { promisePool } = require('../config/database');
    
    // Query untuk mendapatkan appointments yang selesai
    const [completedAppointments] = await promisePool.query(
      `SELECT 
        a.*,
        m.name as member_name,
        t.name as treatment_name,
        th.name as therapist_name
      FROM appointments a
      LEFT JOIN members m ON a.member_id = m.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      LEFT JOIN therapists th ON a.therapist_id = th.id
      WHERE a.member_id = ? AND a.status = 'completed'
      ORDER BY a.date DESC`,
      [id]
    );
    
    console.log('📊 Found completed appointments:', completedAppointments.length);
    
    if (completedAppointments.length === 0) {
      // Update member dengan 0 visits dan never
      await Member.update(id, {
        total_visits: 0,
        last_visit: 'Belum Pernah'
      });
      
      console.log('✅ Member synced: 0 visits');
      
      return res.json({ 
        success: true, 
        message: 'Member synced successfully',
        data: {
          total_visits: 0,
          last_visit: 'Belum Pernah'
        }
      });
    }
    
    // Hitung total visits
    const totalVisits = completedAppointments.length;
    
    // Ambil last visit (yang paling baru)
    const lastVisit = completedAppointments[0].date;
    
    // Update member di database
    await Member.update(id, {
      total_visits: totalVisits,
      last_visit: lastVisit
    });
    
    console.log(`✅ Member synced: ${totalVisits} visits, last visit: ${lastVisit}`);
    
    res.json({ 
      success: true, 
      message: 'Member synced successfully',
      data: {
        total_visits: totalVisits,
        last_visit: lastVisit,
        appointment_count: completedAppointments.length
      }
    });
  } catch (error) {
    console.error('❌ Error syncing member:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync member',
      message: error.message 
    });
  }
};

// Sinkronkan semua members dengan appointments
exports.syncAllMembers = async (req, res) => {
  try {
    console.log('🔄 Syncing all members with appointments');
    
    const { promisePool } = require('../config/database');
    
    // Ambil semua members
    const [allMembers] = await promisePool.query('SELECT id FROM members');
    
    console.log(`📊 Found ${allMembers.length} members to sync`);
    
    let syncedCount = 0;
    const results = [];
    
    for (const member of allMembers) {
      try {
        // Query untuk mendapatkan completed appointments per member
        const [completedAppointments] = await promisePool.query(
          `SELECT date FROM appointments 
           WHERE member_id = ? AND status = 'completed'
           ORDER BY date DESC`,
          [member.id]
        );
        
        const totalVisits = completedAppointments.length;
        const lastVisit = completedAppointments.length > 0 
          ? completedAppointments[0].date 
          : 'Belum Pernah';
        
        // Update member
        await Member.update(member.id, {
          total_visits: totalVisits,
          last_visit: lastVisit
        });
        
        syncedCount++;
        results.push({
          member_id: member.id,
          total_visits: totalVisits,
          last_visit: lastVisit
        });
      } catch (err) {
        console.error(`Error syncing member ${member.id}:`, err);
      }
    }
    
    console.log(`✅ Synced ${syncedCount} members`);
    
    res.json({ 
      success: true, 
      message: `All members synced successfully (${syncedCount}/${allMembers.length})`,
      synced_count: syncedCount,
      data: results 
    });
  } catch (error) {
    console.error('❌ Error syncing all members:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync all members',
      message: error.message 
    });
  }
};

// Get member statistics
exports.getMemberStats = async (req, res) => {
  try {
    const stats = await Member.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting member stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get member stats',
      message: error.message 
    });
  }
};