/**
 * Appointment Reminder Routes
 * API endpoints untuk manage reminders
 */

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const reminderService = require('../services/reminderService');

/**
 * GET /api/reminders/stats
 * Get reminder statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await Appointment.getReminderStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/reminders/pending
 * Get pending reminders (not sent yet)
 */
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const hoursBefore = req.query.hours || 2;
    const pending = await Appointment.getPendingReminders(hoursBefore);
    
    res.json({
      success: true,
      data: pending,
      count: pending.length,
      message: `Found ${pending.length} pending reminder(s)`
    });
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reminders',
      error: error.message
    });
  }
});

/**
 * GET /api/reminders/history
 * Get reminder history (reminders that have been sent)
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await Appointment.getWithReminderHistory();
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder history',
      error: error.message
    });
  }
});

/**
 * GET /api/reminders/:appointmentId/status
 * Get reminder status untuk specific appointment
 */
router.get('/:appointmentId/status', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const status = await Appointment.getReminderStatus(appointmentId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching reminder status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reminder status',
      error: error.message
    });
  }
});

/**
 * POST /api/reminders/:appointmentId/send
 * Send reminder manually untuk specific appointment
 */
router.post('/:appointmentId/send', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    console.log('📧 Manual reminder request for appointmentId:', appointmentId);
    
    // Get appointment details
    const appointment = await Appointment.getByIdWithDetails(appointmentId);
    
    console.log('🔍 Found appointment:', appointment ? 'YES' : 'NO', appointment?.id, appointment?.appointment_id);
    
    if (!appointment) {
      console.error('❌ Appointment not found for ID:', appointmentId);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.member_email) {
      console.error('❌ No email found for appointment:', appointmentId);
      return res.status(400).json({
        success: false,
        message: 'Appointment does not have a customer email'
      });
    }

    console.log('📧 Sending reminder to:', appointment.member_email);

    // Send reminder
    const sent = await reminderService.sendReminderEmail(appointment);

    if (sent) {
      res.json({
        success: true,
        message: `Reminder email sent to ${appointment.member_email}`,
        appointment_id: appointmentId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send reminder email'
      });
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder',
      error: error.message
    });
  }
});

/**
 * POST /api/reminders/send-all
 * Trigger reminder check and send all pending reminders
 */
router.post('/send-all', authenticateToken, async (req, res) => {
  try {
    const hoursBefore = req.body.hours || 2;
    
    console.log(`📧 Manual trigger: Checking for reminders (${hoursBefore} hours before)`);
    
    // Get pending appointments
    const pending = await Appointment.getPendingReminders(hoursBefore);
    
    if (pending.length === 0) {
      return res.json({
        success: true,
        message: 'No pending reminders found',
        sent: 0
      });
    }

    let sent = 0;
    const results = [];

    for (const appointment of pending) {
      try {
        const result = await reminderService.sendReminderEmail(appointment);
        if (result) {
          sent++;
          results.push({
            appointment_id: appointment.id,
            email: appointment.member_email,
            status: 'sent'
          });
        }
      } catch (error) {
        results.push({
          appointment_id: appointment.id,
          email: appointment.member_email,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully sent ${sent} reminder(s) out of ${pending.length} pending`,
      sent,
      total: pending.length,
      details: results
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminders',
      error: error.message
    });
  }
});

/**
 * PUT /api/reminders/:appointmentId/reset
 * Reset reminder status (untuk re-send reminder)
 */
router.put('/:appointmentId/reset', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const result = await Appointment.resetReminder(appointmentId);
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Reminder status reset. Appointment ready for re-reminder',
      appointment_id: appointmentId
    });
  } catch (error) {
    console.error('Error resetting reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset reminder',
      error: error.message
    });
  }
});

/**
 * GET /api/reminders/service/status
 * Get reminder service status
 */
router.get('/service/status', authenticateToken, async (req, res) => {
  try {
    const isRunning = reminderService.isRunning;
    const stats = await Appointment.getReminderStats();
    
    res.json({
      success: true,
      data: {
        service_running: isRunning,
        check_interval_minutes: reminderService.checkIntervalMinutes,
        reminder_hours_before: reminderService.reminderHoursBefore,
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error getting service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service status',
      error: error.message
    });
  }
});

module.exports = router;
