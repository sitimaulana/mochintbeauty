const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/Admin');
const memberModel = require('../models/Member');
const emailService = require('../services/emailService');

// In-memory storage untuk OTP (dalam production, gunakan Redis atau database)
const otpStorage = new Map();

// Rate limiting untuk OTP (prevent spam)
const otpRateLimit = new Map();
const OTP_RATE_LIMIT_SECONDS = 30; // Minimum 30 seconds between OTP requests

const normalizeRow = (res) => {
  if (!res) return null;
  if (Array.isArray(res)) return res[0] || null;
  // If model returns object or class instance
  return res;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const normalizedEmail = email.toLowerCase().trim();

    // Try admin first
    const adminRes = await adminModel.findByEmail(normalizedEmail);
    const admin = normalizeRow(adminRes);

    if (admin && admin.password) {
      const validPass = await bcrypt.compare(password, admin.password);
      if (!validPass) return res.status(400).json({ success: false, error: 'Invalid password' });

      const token = jwt.sign(
        { id: admin.id, email: admin.email, user_type: 'admin', role: admin.role || 'admin' },
        process.env.JWT_SECRET || 'mochint_secret_key',
        { expiresIn: '24h' }
      );

      const user = {
        id: admin.id,
        username: admin.username || admin.email,
        email: admin.email,
        full_name: admin.full_name || null,
        role: admin.role || 'admin',
        user_type: 'admin'
      };

      return res.json({ success: true, token, user });
    }

    // Try member
    const memberRes = await memberModel.findByEmail(normalizedEmail);
    const member = normalizeRow(memberRes);

    if (member && member.password) {
      const validPass = await bcrypt.compare(password, member.password);
      if (!validPass) return res.status(400).json({ success: false, error: 'Invalid password' });

      // Check if email is verified
      if (!member.email_verified) {
        console.log(`⚠️ Login attempt with unverified email: ${normalizedEmail}`);
        return res.status(403).json({ 
          success: false, 
          error: 'Email belum diverifikasi. Silakan check email Anda dan verifikasi dengan kode OTP.',
          emailNotVerified: true,
          needsEmailVerification: true,
          memberId: member.id,
          email: member.email
        });
      }

      const token = jwt.sign(
        { id: member.id, email: member.email, user_type: 'member' },
        process.env.JWT_SECRET || 'mochint_secret_key',
        { expiresIn: '24h' }
      );

      const user = {
        id: member.id,
        name: member.name || member.email,
        email: member.email,
        user_type: 'member'
      };

      return res.json({ success: true, token, user });
    }

    return res.status(404).json({ success: false, error: 'User not found' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password minimal 6 karakter' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Cek email sudah ada (normalize hasil)
    const existingMemberRes = await memberModel.findByEmail(normalizedEmail);
    const existingMember = normalizeRow(existingMemberRes);
    if (existingMember) {
      return res.status(409).json({ success: false, error: 'Email sudah terdaftar' });
    }

    const existingAdminRes = await adminModel.findByEmail(normalizedEmail);
    const existingAdmin = normalizeRow(existingAdminRes);
    if (existingAdmin) {
      return res.status(409).json({ success: false, error: 'Email sudah terdaftar' });
    }

    // Buat member baru dengan email_verified: false
    const newMember = await memberModel.create({
      name,
      email: normalizedEmail,
      phone,
      address,
      password
    });

    // Ensure returned object contains id/email/name
    const created = normalizeRow(newMember) || newMember;

    console.log(`📝 New member created: ${created.email}, email_verified: ${created.email_verified}`);

    // Generate dan kirim OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    otpStorage.set(normalizedEmail, {
      otp,
      expiryTime,
      verified: false,
      memberId: created.id // Store member ID untuk update nanti
    });

    otpRateLimit.set(normalizedEmail, Date.now());

    console.log(`📨 OTP generated for ${normalizedEmail}: ${otp}`);

    // Send OTP via email
    try {
      const emailResult = await emailService.sendOTPEmail(normalizedEmail, otp, name || 'Member');
      
      // Clean up expired OTPs periodically
      cleanupExpiredOTPs();

      // Response berdasarkan mode
      if (emailResult.devMode) {
        console.log('=================================');
        console.log('📧 OTP EMAIL VERIFICATION (DEV MODE)');
        console.log('=================================');
        console.log(`To: ${email}`);
        console.log(`Name: ${name || 'Member'}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log('=================================');
      }

      // Return response untuk email verification flow
      const user = {
        id: created.id,
        name: created.name || name,
        email: created.email || normalizedEmail,
        user_type: 'member',
        email_verified: false
      };

      return res.status(201).json({ 
        success: true, 
        message: 'Akun berhasil dibuat. Silakan verifikasi email Anda.',
        user,
        requiresEmailVerification: true,
        ...(emailResult.devMode && { devOTP: otp })
      });

    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError.message);
      
      // Fallback - return dengan pesan error tapi akun tetap dibuat
      const user = {
        id: created.id,
        name: created.name || name,
        email: created.email || normalizedEmail,
        user_type: 'member',
        email_verified: false
      };

      return res.status(201).json({ 
        success: true, 
        message: 'Akun berhasil dibuat tapi gagal mengirim OTP. Silakan coba kirim ulang.',
        user,
        requiresEmailVerification: true,
        warning: 'Email service error',
        devOTP: otp
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Google OAuth callback handler
const googleCallback = async (req, res) => {
  try {
    // req.user sudah di-set oleh middleware passport
    const user = req.user;
    
    if (!user) {
      console.error('❌ No user in googleCallback');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Error</title><meta charset="utf-8"></head>
          <body>
            <script>
              console.error('❌ No user received');
              if (window.opener) {
                window.opener.postMessage({ success: false, error: 'User not found' }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `);
    }

    console.log('✅ User dari Passport:', user.email);

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: 'member' },
      process.env.JWT_SECRET || 'mochint_secret_key',
      { expiresIn: '24h' }
    );

    // Check if user needs to set password (password is null)
    const needsPassword = !user.password || user.password === null;

    const userData = {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      user_type: 'member',
      google_id: user.google_id || null,
      profile_picture: user.profile_picture || null,
      needsPassword: needsPassword
    };

    console.log(`🔐 Google OAuth - User ${user.email}, needsPassword: ${needsPassword}`);

    // Return HTML dengan proper postMessage handling dan fallback
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Processing Login...</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 20px; font-family: sans-serif;">
          <div style="text-align: center; margin-top: 50px;">
            <p>Processing your login...</p>
          </div>
          <script>
            console.log('🔐 OAuth Callback Started');
            
            const token = '${token}';
            const userData = ${JSON.stringify(userData)};
            const frontendUrl = '${frontendUrl}';
            
            console.log('✅ OAuth Data Prepared, Token length:', token.length);
            console.log('window.opener:', !!window.opener);
            console.log('window.parent !== window.self:', window.parent !== window.self);
            
            function sendMessage() {
              try {
                const message = {
                  success: true,
                  token: token,
                  user: userData
                };
                
                if (window.opener) {
                  console.log('📤 Sending postMessage to window.opener');
                  window.opener.postMessage(message, '*');
                  console.log('✅ Message sent to opener');
                  setTimeout(() => { window.close(); }, 500);
                  return;
                }
                
                if (window.parent && window.parent !== window.self) {
                  console.log('📤 Sending postMessage to window.parent');
                  window.parent.postMessage(message, '*');
                  console.log('✅ Message sent to parent');
                  return;
                }
                
                console.log('⚠️ No popup/parent found, falling back to redirect');
                const url = frontendUrl + '/auth/google/callback?token=' + encodeURIComponent(token) + '&user=' + encodeURIComponent(JSON.stringify(userData));
                window.location.href = url;
              } catch (err) {
                console.error('❌ Error:', err);
                window.location.href = frontendUrl + '/auth/login?error=callback_error';
              }
            }
            
            sendMessage();
            setTimeout(sendMessage, 1000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title><meta charset="utf-8"></head>
        <body>
          <script>
            const message = { success: false, error: '${error.message}' };
            const frontendUrl = '${frontendUrl}';
            
            if (window.opener) {
              window.opener.postMessage(message, '*');
              window.close();
            } else if (window.parent !== window.self) {
              window.parent.postMessage(message, '*');
            } else {
              window.location.href = frontendUrl + '/auth/login?error=server_error';
            }
          </script>
        </body>
      </html>
    `);
  }
};

// Send OTP to email
const sendOTP = async (req, res) => {
  try {
    console.log('📨 Received OTP request:', req.body);
    const { email, name } = req.body;

    if (!email) {
      console.log('⚠️ No email provided');
      return res.status(400).json({ success: false, message: 'Email diperlukan' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit - prevent sending OTP too frequently
    const lastOtpTime = otpRateLimit.get(normalizedEmail);
    const now = Date.now();
    const timeSinceLastOtp = lastOtpTime ? (now - lastOtpTime) / 1000 : Infinity;

    if (timeSinceLastOtp < OTP_RATE_LIMIT_SECONDS) {
      const remainingSeconds = Math.ceil(OTP_RATE_LIMIT_SECONDS - timeSinceLastOtp);
      console.log(`⚠️ Rate limit exceeded for ${normalizedEmail}. Wait ${remainingSeconds}s`);
      
      return res.status(429).json({ 
        success: false, 
        message: `Tunggu ${remainingSeconds} detik sebelum mengirim OTP baru` 
      });
    }

    // Update rate limit timestamp
    otpRateLimit.set(normalizedEmail, now);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (10 minutes for sufficient verification time)
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    otpStorage.set(normalizedEmail, {
      otp,
      expiryTime,
      verified: false
    });

    console.log('✅ OTP stored for:', normalizedEmail);

    // Send OTP via email service
    try {
      const emailResult = await emailService.sendOTPEmail(normalizedEmail, otp, name || 'Member');
      
      // Clean up expired OTPs periodically
      cleanupExpiredOTPs();

      // Response berdasarkan mode
      if (emailResult.devMode) {
        // Development mode - email service tidak aktif
        console.log('=================================');
        console.log('📧 OTP EMAIL VERIFICATION (DEV MODE)');
        console.log('=================================');
        console.log(`To: ${email}`);
        console.log(`Name: ${name || 'Member'}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires in: 10 minutes`);
        console.log('=================================');
        
        return res.json({ 
          success: true, 
          message: 'Kode OTP berhasil dikirim (Dev Mode)',
          otp: otp, // Return OTP in development mode for easy testing
          devOTP: otp,
          devMode: true
        });
      } else {
        // Production mode - email terkirim
        console.log(`✅ OTP email sent successfully to: ${normalizedEmail}`);
        
        return res.json({ 
          success: true, 
          message: 'Kode OTP berhasil dikirim ke email Anda',
          // Jangan return OTP di production mode untuk keamanan
          ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
        });
      }
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError.message);
      
      // Fallback ke console log jika email gagal
      console.log('=================================');
      console.log('📧 OTP EMAIL (FALLBACK TO CONSOLE)');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log('=================================');
      
      return res.json({ 
        success: true, 
        message: 'Kode OTP tersimpan (Email service error, check console)',
        otp: otp,
        devOTP: otp,
        warning: 'Email service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim OTP' });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email dan OTP diperlukan' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const storedData = otpStorage.get(normalizedEmail);

    if (!storedData) {
      return res.status(400).json({ success: false, message: 'OTP tidak ditemukan atau sudah kadaluarsa' });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiryTime) {
      otpStorage.delete(normalizedEmail);
      return res.status(400).json({ success: false, message: 'OTP sudah kadaluarsa' });
    }

    // Check if OTP matches
    if (storedData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid' });
    }

    // Mark as verified
    storedData.verified = true;
    otpStorage.set(normalizedEmail, storedData);

    // Update email_verified status in database if memberId exists
    let token = null;
    let user = null;

    if (storedData.memberId) {
      try {
        await memberModel.updateEmailVerified(storedData.memberId, true);
        console.log(`✅ Email verified for member ID: ${storedData.memberId}`);

        // For manual registration, fetch member and generate token for auto-login
        const memberData = await memberModel.getById(storedData.memberId);
        if (memberData) {
          // Generate token for auto-login (manual registration already has password)
          token = jwt.sign(
            { id: memberData.id, email: memberData.email, user_type: 'member' },
            process.env.JWT_SECRET || 'mochint_secret_key',
            { expiresIn: '24h' }
          );

          user = {
            id: memberData.id,
            name: memberData.name || memberData.email,
            email: memberData.email,
            user_type: 'member',
            email_verified: true
          };

          console.log(`🔐 Token generated for auto-login: ${memberData.email}`);
        }
      } catch (dbError) {
        console.error('⚠️ Failed to update email_verified in database:', dbError);
        // Continue anyway - OTP verification is still successful
      }
    }

    return res.json({ 
      success: true, 
      message: 'Email berhasil diverifikasi',
      token: token, // Include token if available (for manual registration auto-login)
      user: user, // Include user data if available
      autoLogin: !!token // Flag to indicate if auto-login is available
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memverifikasi OTP' });
  }
};

// Set password for Google OAuth users
const setPassword = async (req, res) => {
  try {
    const { email, password, userId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password diperlukan' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if OTP was verified
    const storedData = otpStorage.get(normalizedEmail);
    if (!storedData || !storedData.verified) {
      return res.status(400).json({ success: false, message: 'Email belum diverifikasi' });
    }

    // Find member by email
    const memberRes = await memberModel.findByEmail(normalizedEmail);
    const member = normalizeRow(memberRes);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member tidak ditemukan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update member password
    await memberModel.updatePassword(member.id, hashedPassword);

    // Clean up OTP storage and rate limit
    otpStorage.delete(normalizedEmail);
    otpRateLimit.delete(normalizedEmail);

    console.log(`✅ Password set successfully for user: ${normalizedEmail}`);

    return res.json({ 
      success: true, 
      message: 'Password berhasil dibuat' 
    });
  } catch (error) {
    console.error('Set password error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat password' });
  }
};

// Helper function to clean up expired OTPs and rate limit entries
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  
  // Clean up expired OTPs
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiryTime) {
      otpStorage.delete(email);
    }
  }
  
  // Clean up rate limit entries older than 5 minutes
  const RATE_LIMIT_CLEANUP_SECONDS = 5 * 60 * 1000;
  for (const [email, timestamp] of otpRateLimit.entries()) {
    if (now - timestamp > RATE_LIMIT_CLEANUP_SECONDS) {
      otpRateLimit.delete(email);
    }
  }
};

module.exports = { login, register, googleCallback, sendOTP, verifyOTP, setPassword };