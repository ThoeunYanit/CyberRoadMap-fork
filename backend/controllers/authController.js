const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { BrevoClient } = require('@getbrevo/brevo');

// ── Brevo Email Setup ─────────────────────────────────────
const brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

// ── Helper: Generate OTP ──────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Helper: Send OTP Email ────────────────────────────────
async function sendOTPEmail(email, name, otp) {
  await brevoClient.transactionalEmails.sendTransacEmail({
    subject: 'CyberPath - Your OTP Code',
    htmlContent: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <h2 style="color:#0d7377;">CyberPath Security Verification</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your OTP verification code is:</p>
        <h1 style="letter-spacing:12px;color:#0d7377;font-size:40px;text-align:center;padding:20px;background:#f0fafa;border-radius:8px;">${otp}</h1>
        <p>This code expires in <strong>5 minutes</strong>.</p>
        <p style="color:#888;font-size:12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    sender: {
      name: 'CyberPath',
      email: process.env.BREVO_SENDER_EMAIL
    },
    to: [{ email }]
  });
}

// ── Helper: Save OTP to DB ────────────────────────────────
function saveOTP(userId, otp) {
  return new Promise((resolve, reject) => {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    db.query(
      'UPDATE otp_codes SET used = TRUE WHERE user_id = ? AND used = FALSE',
      [userId],
      (err) => {
        if (err) return reject(err);
        db.query(
          'INSERT INTO otp_codes (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
          [userId, otp, expiresAt],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      }
    );
  });
}

// ── REGISTER (no OTP) ─────────────────────────────────────
exports.register = (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length > 0) return res.status(409).json({ message: 'Email already registered' });

    const hashed = bcrypt.hashSync(password, 10);
    db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Registration failed' });
        const token = jwt.sign(
          { id: result.insertId, role: 'user' },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        res.status(201).json({
          success: true,
          token,
          userId: result.insertId,
          username
        });
      }
    );
  });
};

// ── LOGIN (no OTP) ────────────────────────────────────────
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' });

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid password' });

    // Update last_login
    db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      userId: user.id,
      username: user.username,
      role: user.role
    });
  });
};

// ── VERIFY OTP (for Google login) ─────────────────────────
exports.verifyOTP = (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp)
    return res.status(400).json({ message: 'userId and otp required' });

  db.query(
    `SELECT * FROM otp_codes 
     WHERE user_id = ? AND otp_code = ? AND used = FALSE AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [userId, otp],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (rows.length === 0)
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

      db.query('UPDATE otp_codes SET used = TRUE WHERE id = ?', [rows[0].id], (err) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        db.query('SELECT * FROM users WHERE id = ?', [userId], (err, users) => {
          if (err) return res.status(500).json({ message: 'DB error' });

          const user = users[0];
          const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.json({
            success: true,
            token,
            userId: user.id,
            username: user.username,
            role: user.role,
            message: 'OTP verified successfully!'
          });
        });
      });
    }
  );
};

// ── RESEND OTP ────────────────────────────────────────────
exports.resendOTP = (req, res) => {
  const { userId } = req.body;
  if (!userId)
    return res.status(400).json({ message: 'userId required' });

  db.query('SELECT * FROM users WHERE id = ?', [userId], async (err, users) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    const otp = generateOTP();

    try {
      await saveOTP(user.id, otp);
      await sendOTPEmail(user.email, user.username, otp);
      res.json({ success: true, message: 'OTP resent successfully' });
    } catch (err) {
      console.error('❌ Resend OTP error:', err.message);
      res.status(500).json({ message: 'Failed to resend OTP: ' + err.message });
    }
  });
};

// ── GOOGLE AUTH CALLBACK → Send OTP ──────────────────────
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const otp = generateOTP();

    await saveOTP(user.id, otp);
    await sendOTPEmail(user.email, user.username, otp);

    res.redirect(`${process.env.CLIENT_URL}/verify-otp?userId=${user.id}&email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error('❌ Google callback error:', err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
  }
};