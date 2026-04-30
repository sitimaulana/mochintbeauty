/**
 * Appointment Reminder Service
 * Mengirim email reminder ke customer sebelum jadwal treatment mereka
 * Berjalan secara otomatis setiap beberapa menit
 */

const { promisePool } = require('../config/database');
const emailService = require('./emailService');

class ReminderService {
  constructor() {
    this.emailService = emailService;
    this.isRunning = false;
    this.checkInterval = null;
    this.reminderHoursBefore = process.env.REMINDER_HOURS_BEFORE || 2; // Default 2 jam sebelum
    this.checkIntervalMinutes = process.env.REMINDER_CHECK_INTERVAL || 10; // Check setiap 10 menit
  }

  /**
   * Initialize dan start reminder service
   */
  async start() {
    try {
      await this.emailService.initialize();
      console.log('🔔 Reminder Service initialized');
      
      this.isRunning = true;
      // Jalankan check pertama kali langsung
      await this.checkAndSendReminders();
      
      // Setup interval untuk check berkala
      this.checkInterval = setInterval(async () => {
        try {
          await this.checkAndSendReminders();
        } catch (error) {
          console.error('❌ Error in reminder check interval:', error.message);
        }
      }, this.checkIntervalMinutes * 60 * 1000); // Convert minutes to milliseconds

      console.log(`✅ Reminder Service started - Checking every ${this.checkIntervalMinutes} minutes`);
      console.log(`⏰ Sending reminders ${this.reminderHoursBefore} hour(s) before appointment`);
    } catch (error) {
      console.error('❌ Failed to start Reminder Service:', error.message);
      this.isRunning = false;
    }
  }

  /**
   * Stop reminder service
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Reminder Service stopped');
  }

  /**
   * Cek appointments yang akan datang dan kirim reminder
   */
  async checkAndSendReminders() {
    try {
      // Get appointments yang belum reminder dan scheduled dalam beberapa jam ke depan
      const appointments = await this.getUpcomingAppointments(this.reminderHoursBefore);
      
      if (appointments.length === 0) {
        // Uncomment untuk debug
        // console.log('ℹ️ No upcoming appointments found for reminders');
        return;
      }

      console.log(`📧 Found ${appointments.length} appointment(s) for reminders`);

      // Kirim reminder untuk setiap appointment
      for (const appointment of appointments) {
        try {
          await this.sendReminderEmail(appointment);
        } catch (error) {
          console.error(`❌ Failed to send reminder for appointment ${appointment.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error checking appointments:', error.message);
    }
  }

  /**
   * Get upcoming appointments yang belum dikirim reminder
   * @param {number} hoursBefore - Berapa jam sebelum appointment untuk mengirim reminder
   */
  async getUpcomingAppointments(hoursBefore = 2) {
    try {
      const [rows] = await promisePool.query(`
        SELECT 
          a.*,
          m.name as member_name,
          m.email as member_email,
          m.phone as member_phone,
          t.name as treatment_name,
          t.duration as treatment_duration,
          th.name as therapist_name
        FROM appointments a
        LEFT JOIN members m ON a.member_id = m.id
        LEFT JOIN treatments t ON a.treatment_id = t.id
        LEFT JOIN therapists th ON a.therapist_id = th.id
        WHERE 
          a.reminder_sent = FALSE
          AND a.status = 'confirmed'
          AND DATE(a.date) = CURDATE()
          AND TIME(CONCAT(a.date, ' ', a.time)) BETWEEN 
              DATE_SUB(NOW(), INTERVAL 5 MINUTE)
              AND DATE_ADD(NOW(), INTERVAL ? HOUR)
        ORDER BY a.date, a.time
      `, [hoursBefore]);

      return rows || [];
    } catch (error) {
      console.error('❌ Error fetching upcoming appointments:', error.message);
      return [];
    }
  }

  /**
   * Kirim email reminder ke customer
   * @param {Object} appointment - Data appointment
   */
  async sendReminderEmail(appointment) {
    if (!appointment.member_email) {
      console.warn(`⚠️ No email found for appointment ${appointment.id}, skipping...`);
      return false;
    }

    try {
      const reminderData = {
        appointmentId: appointment.id,
        appointmentNo: appointment.appointment_id,
        customerName: appointment.member_name || appointment.customer_name,
        treatmentName: appointment.treatment_name,
        treatmentDuration: appointment.treatment_duration,
        therapistName: appointment.therapist_name,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        amount: appointment.amount,
        email: appointment.member_email
      };

      // Send email
      const result = await this.emailService.sendReminderEmail(reminderData);

      if (result.success) {
        // Update appointment untuk mark sebagai reminder sent
        await this.markReminderSent(appointment.id);
        console.log(`✅ Reminder email sent for appointment #${appointment.appointment_id} to ${appointment.member_email}`);
        return true;
      } else {
        console.warn(`⚠️ Failed to send reminder email: ${result.message}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error sending reminder email for appointment ${appointment.id}:`, error.message);
      return false;
    }
  }

  /**
   * Mark appointment reminder sebagai sudah dikirim
   */
  async markReminderSent(appointmentId) {
    try {
      await promisePool.query(
        `UPDATE appointments 
         SET reminder_sent = TRUE, reminder_sent_at = NOW()
         WHERE id = ?`,
        [appointmentId]
      );
    } catch (error) {
      console.error(`❌ Error updating reminder status for appointment ${appointmentId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get reminder statistics
   */
  async getStatistics() {
    try {
      const [stats] = await promisePool.query(`
        SELECT 
          COUNT(*) as total_appointments,
          SUM(CASE WHEN reminder_sent = TRUE THEN 1 ELSE 0 END) as reminders_sent,
          SUM(CASE WHEN reminder_sent = FALSE AND status = 'confirmed' THEN 1 ELSE 0 END) as pending_reminders
        FROM appointments
        WHERE date >= CURDATE()
      `);

      return stats[0] || {};
    } catch (error) {
      console.error('❌ Error getting reminder statistics:', error.message);
      return {};
    }
  }

  /**
   * Manual trigger untuk mengirim reminder ke specific appointment
   */
  async sendManualReminder(appointmentId) {
    try {
      const [appointments] = await promisePool.query(`
        SELECT 
          a.*,
          m.name as member_name,
          m.email as member_email,
          m.phone as member_phone,
          t.name as treatment_name,
          t.duration as treatment_duration,
          th.name as therapist_name
        FROM appointments a
        LEFT JOIN members m ON a.member_id = m.id
        LEFT JOIN treatments t ON a.treatment_id = t.id
        LEFT JOIN therapists th ON a.therapist_id = th.id
        WHERE a.id = ?
      `, [appointmentId]);

      if (!appointments || appointments.length === 0) {
        throw new Error('Appointment not found');
      }

      return await this.sendReminderEmail(appointments[0]);
    } catch (error) {
      console.error('❌ Error sending manual reminder:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new ReminderService();
