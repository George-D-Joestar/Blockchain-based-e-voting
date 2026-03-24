require("dotenv").config();
const mysql = require("mysql2/promise");

console.log("📋 Database Connection Test");
console.log("============================");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD || "(empty)");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("============================\n");

const testConnection = async () => {
  try {
    console.log("🔄 Attempting to connect to MySQL...\n");

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

    console.log("✅ Connected successfully!\n");

    // Test query
    console.log("🔄 Testing database query...\n");
    const [rows] = await connection.execute("SELECT * FROM users LIMIT 1");
    console.log("✅ Query successful!");
    console.log("Sample data:", rows);

    await connection.end();
    console.log("\n✅ Test completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Connection Failed:");
    console.error("Error Code:", err.code);
    console.error("Error Message:", err.message);
    console.error("\nFull Error:", err);

    // Suggest solutions based on error
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("\n💡 Solution: MySQL server is down or host unreachable");
    } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n💡 Solution: Check username or password");
    } else if (err.code === "ER_BAD_DB_ERROR") {
      console.error("\n💡 Solution: Database doesn't exist");
    } else if (err.code === "ENOTFOUND") {
      console.error("\n💡 Solution: Host is unreachable (wrong IP or offline)");
    }

    process.exit(1);
  }
};

testConnection();
