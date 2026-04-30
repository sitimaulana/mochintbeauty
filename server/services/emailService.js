const nodemailer = require('nodemailer');

/**
 * Email Service untuk mengirim email menggunakan Nodemailer
 * Mendukung Gmail dan SMTP lainnya
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter dengan konfigurasi dari environment variables
   */
  async initialize() {
    try {
      // Validasi konfigurasi
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️ Email service not configured. Using development mode (OTP in console).');
        this.initialized = false;
        return false;
      }

      const emailConfig = {
        host: 'smtp.gmail.com', // Explicit host untuk Gmail
        port: 465, // Port SSL
        secure: true, // true untuk port 465 (SSL)
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD // App Password for Gmail
        },
        // Force IPv4 untuk menghindari error ENETUNREACH dengan IPv6
        family: 4,
        // TLS configuration
        tls: {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2',
          ciphers: 'SSLv3'
        },
        // Connection settings - Timeout lebih panjang
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 10000,
        socketTimeout: 30000,
        // Debug output
        debug: false,
        logger: false
      };

      // Jika menggunakan service lain (Outlook, Yahoo, dll)
      if (process.env.EMAIL_SERVICE && process.env.EMAIL_SERVICE !== 'gmail') {
        emailConfig.service = process.env.EMAIL_SERVICE;
        delete emailConfig.host;
        delete emailConfig.port;
      }

      this.transporter = nodemailer.createTransport(emailConfig);

      // SKIP verify saat startup untuk menghindari blocking
      // Verify akan dilakukan saat kirim email pertama kali (lazy verification)
      console.log('📧 Email service configured (will verify on first send)');
      console.log(`   Set di .env: ${process.env.EMAIL_USER}`);
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.log('💡 Tip: Pastikan App Password Gmail sudah benar dan 2FA sudah aktif');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Kirim email OTP untuk verifikasi
   * @param {string} email - Email tujuan
   * @param {string} otp - Kode OTP 6 digit
   * @param {string} name - Nama penerima (optional)
   */
  async sendOTPEmail(email, otp, name = 'Member') {
    if (!this.initialized) {
      console.log('📧 Email service not active. OTP Code:', otp);
      return { success: true, message: 'Development mode - OTP logged to console', devMode: true };
    }

    try {
      const mailOptions = {
        from: {
          name: 'Mochint Beauty Clinic',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Kode Verifikasi OTP - Mochint Beauty Clinic',
        html: this.getOTPEmailTemplate(otp, name)
      };

      console.log('📤 Sending email to:', email);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      
      return { 
        success: true, 
        message: 'Email sent successfully',
        messageId: info.messageId 
      };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      
      // Diagnostic information
      if (error.code === 'EAUTH') {
        console.log('💡 Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD in .env');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
        console.log('💡 Connection timeout. Possible causes:');
        console.log('   - Firewall/Antivirus blocking SMTP port 465');
        console.log('   - ISP blocking SMTP connections');
        console.log('   - Network connectivity issues');
      }
      
      // Return error but don't crash - let it fallback to console mode
      throw new Error(`Gagal mengirim email: ${error.message}`);
    }
  }

  /**
   * HTML Template untuk email OTP
   */
  getOTPEmailTemplate(otp, name) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Verifikasi OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #FDFBF7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FDFBF7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8D6E63 0%, #5D4037 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Mochint Beauty Clinic</h1>
              <p style="color: #EFEBE9; margin: 10px 0 0 0; font-size: 14px;">Your Beauty, Our Priority</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #3E2723; margin: 0 0 20px 0; font-size: 24px;">Halo, ${name}!</h2>
              <p style="color: #5D4037; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Terima kasih telah menggunakan layanan Mochint Beauty Clinic. Berikut adalah kode verifikasi OTP Anda:
              </p>
              
              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px; background-color: #FDFBF7; border-radius: 15px; border: 3px dashed #8D6E63;">
                    <div style="font-size: 42px; font-weight: bold; color: #3E2723; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #8D6E63; font-size: 14px; text-align: center; margin: 20px 0 30px 0;">
                 Kode ini berlaku selama <strong>5 menit</strong>
              </p>
              
              <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #E65100; font-size: 13px; margin: 0; line-height: 1.5;">
                  <strong> Peringatan Keamanan:</strong><br>
                  Jangan bagikan kode ini kepada siapapun, termasuk staff Mochint. Kami tidak akan pernah meminta kode OTP Anda melalui telepon atau email.
                </p>
              </div>
              
              <p style="color: #757575; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0;">
                Jika Anda tidak melakukan permintaan ini, abaikan email ini dan akun Anda tetap aman.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F5F5F5; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
              <p style="color: #757575; font-size: 12px; margin: 0 0 10px 0;">
                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
              </p>
              <p style="color: #757575; font-size: 12px; margin: 0;">
                &copy; 2026 Mochint Beauty Clinic. All rights reserved.
              </p>
              <div style="margin-top: 15px;">
                <a href="#" style="color: #8D6E63; text-decoration: none; margin: 0 10px; font-size: 12px;">Website</a>
                <a href="#" style="color: #8D6E63; text-decoration: none; margin: 0 10px; font-size: 12px;">Instagram</a>
                <a href="#" style="color: #8D6E63; text-decoration: none; margin: 0 10px; font-size: 12px;">Contact</a>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Kirim email reset password confirmation
   */
  async sendPasswordResetConfirmation(email, name = 'Member') {
    if (!this.initialized) {
      console.log('Email service not active. Password reset confirmation not sent.');
      return { success: true, devMode: true };
    }

    try {
      const mailOptions = {
        from: {
          name: 'Mochint Beauty Clinic',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Password Berhasil Direset - Mochint Beauty Clinic',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background-color: #FDFBF7; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 20px; padding: 40px;">
    <h2 style="color: #3E2723;">Password Berhasil Direset</h2>
    <p style="color: #5D4037;">Halo, ${name}!</p>
    <p style="color: #5D4037;">Password Anda telah berhasil direset. Anda sekarang dapat login menggunakan password baru Anda.</p>
    <p style="color: #8D6E63; font-size: 14px; margin-top: 30px;">Jika Anda tidak melakukan reset password, segera hubungi kami.</p>
    <hr style="border: none; border-top: 1px solid #E0E0E0; margin: 30px 0;">
    <p style="color: #757575; font-size: 12px;">© 2026 Mochint Beauty Clinic</p>
  </div>
</body>
</html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset confirmation sent to:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      // Don't throw error for confirmation emails
      return { success: false };
    }
  }

  /**
   * Kirim email reminder appointment
   * @param {Object} reminderData - Data reminder
   */
  async sendReminderEmail(reminderData) {
    if (!this.initialized) {
      console.log('📧 Email service not active. Reminder email not sent.');
      console.log('   Appointment:', reminderData.appointmentNo);
      console.log('   Customer:', reminderData.customerName);
      console.log('   Date/Time:', `${reminderData.appointmentDate} ${reminderData.appointmentTime}`);
      return { success: true, devMode: true };
    }

    try {
      const mailOptions = {
        from: {
          name: 'Mochint Beauty Clinic',
          address: process.env.EMAIL_USER
        },
        to: reminderData.email,
        subject: `Pengingat Jadwal Perawatan - ${reminderData.treatmentName} (${reminderData.appointmentNo})`,
        html: this.getReminderEmailTemplate(reminderData)
      };

      console.log('📤 Sending reminder email to:', reminderData.email);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Reminder email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
      
      return { 
        success: true, 
        message: 'Reminder email sent successfully',
        messageId: info.messageId 
      };
    } catch (error) {
      console.error('❌ Error sending reminder email:', error.message);
      throw new Error(`Gagal mengirim email reminder: ${error.message}`);
    }
  }

  /**
   * HTML Template untuk email reminder appointment
   */
  getReminderEmailTemplate(data) {
    const appointmentDateTime = new Date(`${data.appointmentDate} ${data.appointmentTime}`);
    const formattedDate = appointmentDateTime.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDateTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Format harga
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(data.amount);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pengingat Jadwal Perawatan</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #FDFBF7;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 20px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #8D6E63 0%, #5D4037 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      color: #3E2723;
      font-size: 18px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .reminder-message {
      background-color: #FFF3E0;
      border-left: 4px solid #FF9800;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
      color: #E65100;
    }
    .reminder-message strong {
      display: block;
      margin-bottom: 5px;
    }
    .appointment-details {
      background-color: #F5F5F5;
      border-radius: 10px;
      padding: 20px;
      margin: 25px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #E0E0E0;
      color: #5D4037;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #3E2723;
      min-width: 150px;
    }
    .detail-value {
      text-align: right;
      color: #5D4037;
    }
    .highlight {
      background-color: #FFECB3;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
      color: #3E2723;
    }
    .info-box {
      background-color: #E3F2FD;
      border-left: 4px solid #2196F3;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      color: #1565C0;
      font-size: 13px;
      line-height: 1.6;
    }
    .action-button {
      display: inline-block;
      background-color: #8D6E63;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 8px;
      margin-top: 20px;
      font-weight: bold;
      text-align: center;
    }
    .action-button:hover {
      background-color: #6D4C41;
    }
    .footer {
      background-color: #F5F5F5;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #E0E0E0;
      color: #757575;
      font-size: 12px;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      color: #8D6E63;
      text-decoration: none;
      margin: 0 10px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Mochint Beauty Clinic</h1>
      <p>✨ Your Beauty, Our Priority ✨</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">Halo, ${data.customerName}! </div>
      
      <div class="reminder-message">
        <strong> Pengingat Jadwal Perawatan</strong>
        Anda memiliki jadwal perawatan yang akan datang. Pastikan Anda siap dan tiba tepat waktu!
      </div>

      <!-- Appointment Details -->
      <div class="appointment-details">
        <div class="detail-row">
          <div class="detail-label"> No. Appointment:</div>
          <div class="detail-value"><strong>${data.appointmentNo}</strong></div>
        </div>
        <div class="detail-row">
          <div class="detail-label"> Perawatan:</div>
          <div class="detail-value"><strong>${data.treatmentName}</strong></div>
        </div>
        <div class="detail-row">
          <div class="detail-label"> Durasi:</div>
          <div class="detail-value">${data.treatmentDuration}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label"> Tanggal:</div>
          <div class="detail-value"><span class="highlight">${formattedDate}</span></div>
        </div>
        <div class="detail-row">
          <div class="detail-label"> Jam:</div>
          <div class="detail-value"><span class="highlight">${formattedTime}</span></div>
        </div>
        ${data.therapistName ? `
        <div class="detail-row">
          <div class="detail-label"> Terapis:</div>
          <div class="detail-value">${data.therapistName}</div>
        </div>
        ` : ''}
        <div class="detail-row">
          <div class="detail-label"> Harga:</div>
          <div class="detail-value"><strong>${formattedAmount}</strong></div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="info-box">
        <strong> Tips:</strong><br>
        • Tiba 10-15 menit sebelum jadwal Anda<br>
        • Pastikan kulit Anda dalam kondisi bersih<br>
        • Hindari makeup tebal sebelum perawatan<br>
        • Hubungi kami jika ingin membatalkan atau mengubah jadwal
      </div>

      <!-- Contact Info -->
      <div style="background-color: #F3E5F5; border-left: 4px solid #9C27B0; padding: 15px; border-radius: 5px; margin: 20px 0; color: #6A1B9A; font-size: 13px;">
        <strong>Perlu Perubahan Jadwal?</strong><br>
        Hubungi kami sebelum jam jadwal Anda untuk membatalkan atau mengubah jadwal.<br>
        <strong>Nomor Telepon:</strong> [Hubungi Clinic]
      </div>

      <center>
        <a href="${process.env.FRONTEND_URL || '#'}" class="action-button">Lihat Jadwal Saya</a>
      </center>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 10px 0;">Email ini dikirim secara otomatis dari sistem appointment Mochint Beauty Clinic.</p>
      <p style="margin: 0;">Jika Anda tidak membuat appointment ini, abaikan email ini.</p>
      <div class="social-links">
        <a href="#">Website</a>
        <a href="#">Instagram</a>
        <a href="#">WhatsApp</a>
        <a href="#">Contact</a>
      </div>
      <p style="margin: 15px 0 0 0; border-top: 1px solid #E0E0E0; padding-top: 15px;">
        &copy; 2026 Mochint Beauty Clinic. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Test email connection
   */
  async testConnection() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      if (!this.initialized) {
        return { success: false, message: 'Email service not configured' };
      }

      await this.transporter.verify();
      return { success: true, message: 'Email connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;
