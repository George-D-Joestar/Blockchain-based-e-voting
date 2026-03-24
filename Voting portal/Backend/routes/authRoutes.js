const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db");

// In-memory OTP storage (stores OTP temporarily, expires after 5 minutes)
const otpStore = new Map();

// Helper function to generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to create JWT token
const createToken = (email) => {
  return jwt.sign({ email, timestamp: Date.now() }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@mgits\.ac\.in$/;
  return emailRegex.test(email);
};

// Helper function to validate password strength
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// ============================================
// 1. REGISTER - Create new user account
// ============================================
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Only @mgits.ac.in email addresses are allowed",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists in database
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT email FROM users WHERE email = ?",
      [email],
    );

    if (rows.length > 0) {
      connection.release();
      return res.status(409).json({ error: "User already registered" });
    }

    // Insert new user into database
    // ⚠️ WARNING: In production, hash the password with bcrypt!
    await connection.execute(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, password],
    );

    connection.release();

    return res.status(201).json({
      message: "Registration successful! Please log in.",
    });
  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      error: "Registration failed: " + err.message,
    });
  }
});

// ============================================
// 2. LOGIN - Authenticate user and send OTP
// ============================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Only @mgits.ac.in email addresses are allowed",
      });
    }

    // Query database for user
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = rows[0];

    // Verify password (⚠️ In production, use bcrypt to compare hashed passwords!)
    if (user.password_hash !== password) {
      connection.release();
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in database (expires after 5 minutes)
    await connection.execute(
      "UPDATE users SET otp = ?, otp_expires = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE email = ?",
      [otp, email],
    );

    connection.release();

    // Log OTP to console (for testing - in production, send via email)
    console.log(`📧 OTP for ${email}: ${otp}`);

    return res.status(200).json({
      message: "OTP sent to your registered email",
      // REMOVE THIS IN PRODUCTION - only for testing
      testOTP: otp,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      error: "Login failed: " + err.message,
    });
  }
});

// ============================================
// 3. VERIFY OTP - Validate OTP and return JWT
// ============================================
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Only @mgits.ac.in email addresses are allowed",
      });
    }

    // Query database for user and stored OTP
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT email, otp, otp_expires FROM users WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      connection.release();
      return res.status(401).json({
        error: "User not found",
      });
    }

    const user = rows[0];

    // Check if OTP exists
    if (!user.otp) {
      connection.release();
      return res.status(400).json({
        error: "OTP not found or expired. Please log in again.",
      });
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otp_expires)) {
      // Clear the OTP if expired
      await connection.execute(
        "UPDATE users SET otp = NULL, otp_expires = NULL WHERE email = ?",
        [email],
      );
      connection.release();
      return res.status(400).json({
        error: "OTP expired. Please request a new one.",
      });
    }

    // Verify OTP matches
    if (user.otp !== otp) {
      connection.release();
      return res.status(401).json({
        error: "Invalid OTP",
      });
    }

    // OTP is valid - create JWT token
    const token = createToken(email);

    // Clear the OTP from database after successful verification
    await connection.execute(
      "UPDATE users SET otp = NULL, otp_expires = NULL WHERE email = ?",
      [email],
    );

    connection.release();

    return res.status(200).json({
      message: "Authentication successful",
      token,
      user: {
        email,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({
      error: "OTP verification failed: " + err.message,
    });
  }
});

// ============================================
// 4. VALIDATE TOKEN - Check if token is valid
// ============================================
router.post("/validate-token", (req, res) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token not found",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      message: "Token is valid",
      user: {
        email: verified.email,
      },
    });
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
});

// ============================================
// 5. LOGOUT - Invalidate token (optional)
// ============================================
router.post("/logout", (req, res) => {
  // In a real app, you might add the token to a blacklist
  return res.status(200).json({
    message: "Logged out successfully",
  });
});

module.exports = router;
