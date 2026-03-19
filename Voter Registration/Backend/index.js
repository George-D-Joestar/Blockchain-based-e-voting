const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Email sender setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Helper: send OTP email
async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`
  });
}

// ── REGISTER: save user + send OTP ──
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email.endsWith('@mgits.ac.in'))
    return res.status(400).json({ message: 'Only @mgits.ac.in emails allowed.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp_expires = Date.now() + 10 * 60 * 1000;

  const sql = `INSERT INTO users (email, password, otp, otp_expires)
               VALUES (?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE otp=?, otp_expires=?`;

  db.query(sql, [email, password, otp, otp_expires, otp, otp_expires], async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent to your email.' });
  });
});

// ── VERIFY EMAIL OTP ──
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'User not found.' });
    const user = results[0];
    if (user.otp !== otp || Date.now() > user.otp_expires)
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    res.json({ message: 'OTP verified.' });
  });
});

// ── SETUP TOTP (returns QR code) ──
app.post('/api/setup-totp', (req, res) => {
  const { email } = req.body;
  const secret = speakeasy.generateSecret({ name: `EVoting (${email})` });
  const sql = "UPDATE users SET totp_secret = ? WHERE email = ?";
  db.query(sql, [secret.base32, email], async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const qr = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ qr, secret: secret.base32 });
  });
});

// ── VERIFY TOTP CODE ──
app.post('/api/verify-totp', (req, res) => {
  const { email, code } = req.body;
  const sql = "SELECT totp_secret FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'User not found.' });
    const verified = speakeasy.totp.verify({
      secret: results[0].totp_secret,
      encoding: 'base32',
      token: code,
      window: 1
    });
    if (!verified) return res.status(401).json({ message: 'Invalid code.' });
    res.json({ message: 'TOTP verified. Registration complete!' });
  });
});

// ── FORGOT PASSWORD: send OTP ──
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp_expires = Date.now() + 10 * 60 * 1000;
  const sql = "UPDATE users SET otp=?, otp_expires=? WHERE email=?";
  db.query(sql, [otp, otp_expires, email], async (err, result) => {
    if (err || result.affectedRows === 0)
      return res.status(404).json({ message: 'Email not found.' });
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent.' });
  });
});

// ── RESET PASSWORD ──
app.post('/api/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'User not found.' });
    const user = results[0];
    if (user.otp !== otp || Date.now() > user.otp_expires)
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    db.query("UPDATE users SET password=? WHERE email=?", [newPassword, email], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Password updated.' });
    });
  });
});

// ── LOGIN (used by Voting Portal) ──
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' });
    const user = results[0];
    if (user.has_voted === 1)
      return res.status(403).json({ message: 'You have already voted.' });
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful.', token, email: user.email });
  });
});

// ── MARK AS VOTED ──
app.post('/api/mark-voted', (req, res) => {
  const { email } = req.body;
  db.query("UPDATE users SET has_voted=1 WHERE email=?", [email], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Voter marked as voted.' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
