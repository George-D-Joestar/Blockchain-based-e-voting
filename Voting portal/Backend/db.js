const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Connected to MySQL Database");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ MySQL Connection Error:", err.message);
  });

module.exports = pool;
