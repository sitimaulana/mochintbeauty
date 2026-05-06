const { promisePool } = require('../config/database');

class MedicalRecord {
  // Get all medical records
  static async getAll() {
    const [rows] = await promisePool.query(`
      SELECT 
        mr.*,
        a.appointment_id,
        a.customer_name,
        a.date,
        a.time,
        t.name as treatment_name,
        m.name as member_name
      FROM medical_records mr
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN members m ON mr.member_id = m.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      ORDER BY mr.created_at DESC
    `);
    return rows;
  }

  // Get medical record by ID
  static async getById(id) {
    const [rows] = await promisePool.query(`
      SELECT 
        mr.*,
        a.appointment_id,
        a.customer_name,
        a.date,
        a.time,
        t.name as treatment_name,
        m.name as member_name,
        m.email as member_email,
        m.phone as member_phone
      FROM medical_records mr
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN members m ON mr.member_id = m.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      WHERE mr.id = ?
    `, [id]);
    return rows[0];
  }

  // Get medical record by appointment ID
  static async getByAppointmentId(appointmentId) {
    const [rows] = await promisePool.query(`
      SELECT 
        mr.*,
        a.appointment_id,
        a.customer_name,
        a.date,
        a.time,
        t.name as treatment_name,
        m.name as member_name,
        m.email as member_email,
        m.phone as member_phone
      FROM medical_records mr
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN members m ON mr.member_id = m.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      WHERE mr.appointment_id = ?
    `, [appointmentId]);
    return rows[0];
  }

  // Get medical records by member ID
  static async getByMemberId(memberId) {
    const [rows] = await promisePool.query(`
      SELECT 
        mr.*,
        a.appointment_id,
        a.customer_name,
        a.date,
        a.time,
        t.name as treatment_name
      FROM medical_records mr
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      WHERE mr.member_id = ?
      ORDER BY mr.created_at DESC
    `, [memberId]);
    return rows;
  }

  // Create new medical record
  static async create(recordData) {
    const {
      appointment_id,
      member_id,
      treatment_name,
      medical_notes,
      before_image_url,
      after_image_url,
      images_json,
      diagnosis,
      treatment_detail,
      recommendations,
      status = 'draft'
    } = recordData;

    const [result] = await promisePool.query(
      `INSERT INTO medical_records 
       (appointment_id, member_id, treatment_name, medical_notes, 
        before_image_url, after_image_url, images_json, diagnosis, 
        treatment_detail, recommendations, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [appointment_id, member_id, treatment_name, medical_notes,
       before_image_url, after_image_url, images_json, diagnosis,
       treatment_detail, recommendations, status]
    );

    return { id: result.insertId, insertId: result.insertId };
  }

  // Update medical record
  static async update(id, recordData) {
    const {
      treatment_name,
      medical_notes,
      before_image_url,
      after_image_url,
      images_json,
      diagnosis,
      treatment_detail,
      recommendations,
      status
    } = recordData;

    // Build dynamic query based on provided fields
    let updates = [];
    let values = [];

    if (treatment_name !== undefined) {
      updates.push('treatment_name = ?');
      values.push(treatment_name);
    }
    if (medical_notes !== undefined) {
      updates.push('medical_notes = ?');
      values.push(medical_notes);
    }
    if (before_image_url !== undefined) {
      updates.push('before_image_url = ?');
      values.push(before_image_url);
    }
    if (after_image_url !== undefined) {
      updates.push('after_image_url = ?');
      values.push(after_image_url);
    }
    if (images_json !== undefined) {
      updates.push('images_json = ?');
      values.push(images_json);
    }
    if (diagnosis !== undefined) {
      updates.push('diagnosis = ?');
      values.push(diagnosis);
    }
    if (treatment_detail !== undefined) {
      updates.push('treatment_detail = ?');
      values.push(treatment_detail);
    }
    if (recommendations !== undefined) {
      updates.push('recommendations = ?');
      values.push(recommendations);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return { affectedRows: 0 };
    }

    values.push(id);
    const query = `UPDATE medical_records SET ${updates.join(', ')} WHERE id = ?`;

    const [result] = await promisePool.query(query, values);
    return result;
  }

  // Delete medical record
  static async delete(id) {
    const [result] = await promisePool.query(
      'DELETE FROM medical_records WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }

  // Update status
  static async updateStatus(id, status) {
    const [result] = await promisePool.query(
      'UPDATE medical_records SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  }

  // Check if appointment has medical records
  static async hasRecords(appointmentId) {
    const [rows] = await promisePool.query(
      'SELECT COUNT(*) as count FROM medical_records WHERE appointment_id = ?',
      [appointmentId]
    );
    return rows[0].count > 0;
  }

  // Get medical records for completed appointments by member
  static async getCompletedByMember(memberId) {
    const [rows] = await promisePool.query(`
      SELECT 
        mr.*,
        a.id as apt_id,
        a.appointment_id,
        a.customer_name,
        a.date,
        a.time,
        t.name as treatment_name
      FROM medical_records mr
      LEFT JOIN appointments a ON mr.appointment_id = a.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      WHERE mr.member_id = ? AND a.status = 'completed' AND mr.status = 'completed'
      ORDER BY a.date DESC
    `, [memberId]);
    return rows;
  }
}

module.exports = MedicalRecord;
