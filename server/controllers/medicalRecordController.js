const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const path = require('path');
const fs = require('fs');

// Get all medical records
exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.getAll();
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error getting medical records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medical records',
      message: error.message
    });
  }
};

// Get medical record by ID
exports.getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await MedicalRecord.getById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error getting medical record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medical record',
      message: error.message
    });
  }
};

// Get medical record by appointment ID
exports.getMedicalRecordByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const record = await MedicalRecord.getByAppointmentId(appointmentId);

    res.json({
      success: true,
      data: record || null
    });
  } catch (error) {
    console.error('Error getting medical record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medical record',
      message: error.message
    });
  }
};

// Get medical records by member ID
exports.getMedicalRecordsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const records = await MedicalRecord.getByMemberId(memberId);

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error getting medical records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medical records',
      message: error.message
    });
  }
};

// Get completed medical records for member
exports.getCompletedMedicalRecordsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const records = await MedicalRecord.getCompletedByMember(memberId);

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error getting medical records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medical records',
      message: error.message
    });
  }
};

// Create medical record with file upload
exports.createMedicalRecord = async (req, res) => {
  try {
    const {
      appointment_id,
      member_id,
      treatment_name,
      medical_notes,
      diagnosis,
      treatment_detail,
      recommendations,
      status = 'draft'
    } = req.body;

    console.log('📥 Creating medical record with data:', {
      appointment_id,
      member_id,
      treatment_name,
      status,
      hasBeforeImage: !!req.files?.before_image,
      hasAfterImage: !!req.files?.after_image
    });

    // Validate required fields
    if (!appointment_id) {
      console.error('❌ Missing appointment_id');
      return res.status(400).json({
        success: false,
        error: 'Appointment ID is required'
      });
    }

    console.log('🔍 Fetching appointment details for ID:', appointment_id);
    
    // Get appointment details
    const appointment = await Appointment.getByIdWithDetails(appointment_id);
    if (!appointment) {
      console.error('❌ Appointment not found for ID:', appointment_id);
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    console.log('✅ Appointment found:', {
      id: appointment.id,
      member_id: appointment.member_id,
      treatment_name: appointment.treatment_name
    });

    // Handle file uploads
    let beforeImageUrl = null;
    let afterImageUrl = null;
    const imagesJson = [];

    if (req.files) {
      // Before image
      if (req.files.before_image) {
        const beforeFile = req.files.before_image[0];
        beforeImageUrl = `/uploads/medical_records/${beforeFile.filename}`;
        console.log('📷 Before image uploaded:', beforeFile.filename);
        imagesJson.push({
          type: 'before',
          url: beforeImageUrl,
          filename: beforeFile.filename,
          uploadedAt: new Date().toISOString()
        });
      }

      // After image
      if (req.files.after_image) {
        const afterFile = req.files.after_image[0];
        afterImageUrl = `/uploads/medical_records/${afterFile.filename}`;
        console.log('📷 After image uploaded:', afterFile.filename);
        imagesJson.push({
          type: 'after',
          url: afterImageUrl,
          filename: afterFile.filename,
          uploadedAt: new Date().toISOString()
        });
      }
    }

    const recordData = {
      appointment_id,
      member_id: member_id || appointment.member_id,
      treatment_name: treatment_name || appointment.treatment_name,
      medical_notes,
      before_image_url: beforeImageUrl,
      after_image_url: afterImageUrl,
      images_json: imagesJson.length > 0 ? JSON.stringify(imagesJson) : null,
      diagnosis,
      treatment_detail,
      recommendations,
      status
    };

    console.log('💾 Saving medical record with data:', {
      appointment_id: recordData.appointment_id,
      member_id: recordData.member_id,
      treatment_name: recordData.treatment_name,
      before_image_url: recordData.before_image_url,
      status: recordData.status
    });

    const result = await MedicalRecord.create(recordData);
    console.log('✅ Medical record created with ID:', result.insertId);
    
    const createdRecord = await MedicalRecord.getById(result.insertId);

    // Try to update appointment flag if the field exists
    // This is optional and won't cause error if field doesn't exist
    try {
      await Appointment.update(appointment_id, { has_medical_records: true });
      console.log('✅ Appointment updated with medical records flag');
    } catch (updateErr) {
      console.warn('⚠️ Could not update appointment flag (field might not exist):', updateErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: createdRecord
    });
  } catch (error) {
    console.error('❌ Error creating medical record:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to create medical record',
      message: error.message,
      details: error.code || error.sqlState
    });
  }
};

// Update medical record with new images
exports.updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      treatment_name,
      medical_notes,
      diagnosis,
      treatment_detail,
      recommendations,
      status
    } = req.body;

    // Check if record exists
    const existingRecord = await MedicalRecord.getById(id);
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    let updateData = {
      treatment_name,
      medical_notes,
      diagnosis,
      treatment_detail,
      recommendations,
      status
    };

    // Handle new file uploads
    if (req.files) {
      const imagesJson = existingRecord.images_json 
        ? JSON.parse(existingRecord.images_json) 
        : [];

      if (req.files.before_image) {
        const beforeFile = req.files.before_image[0];
        const beforeUrl = `/uploads/medical_records/${beforeFile.filename}`;
        updateData.before_image_url = beforeUrl;
        
        // Remove old before image from JSON
        const newImagesJson = imagesJson.filter(img => img.type !== 'before');
        newImagesJson.push({
          type: 'before',
          url: beforeUrl,
          filename: beforeFile.filename,
          uploadedAt: new Date().toISOString()
        });
        updateData.images_json = JSON.stringify(newImagesJson);
      }

      if (req.files.after_image) {
        const afterFile = req.files.after_image[0];
        const afterUrl = `/uploads/medical_records/${afterFile.filename}`;
        updateData.after_image_url = afterUrl;
        
        // Remove old after image from JSON
        const newImagesJson = updateData.images_json 
          ? JSON.parse(updateData.images_json)
          : (imagesJson.filter(img => img.type !== 'after'));
        newImagesJson.push({
          type: 'after',
          url: afterUrl,
          filename: afterFile.filename,
          uploadedAt: new Date().toISOString()
        });
        updateData.images_json = JSON.stringify(newImagesJson);
      }
    }

    const result = await MedicalRecord.update(id, updateData);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    const updatedRecord = await MedicalRecord.getById(id);

    res.json({
      success: true,
      message: 'Medical record updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update medical record',
      message: error.message
    });
  }
};

// Delete medical record
exports.deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const affectedRows = await MedicalRecord.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete medical record',
      message: error.message
    });
  }
};

// Update medical record status (draft -> completed)
exports.updateMedicalRecordStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be draft or completed'
      });
    }

    const affectedRows = await MedicalRecord.updateStatus(id, status);

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    const updatedRecord = await MedicalRecord.getById(id);

    res.json({
      success: true,
      message: 'Medical record status updated successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error updating medical record status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update medical record status',
      message: error.message
    });
  }
};
