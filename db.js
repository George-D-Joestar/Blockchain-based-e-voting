const mysql = require('mysql2');

// This is the bridge between Sara's Database and Node.js
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // XAMPP default
  password: '',      // XAMPP default is empty
  database: 'voting_system'
});

db.connect((err) => {
  if (err) {
    console.error('Connection failed! Check if XAMPP is green: ' + err.stack);
    return;
  }
  console.log('Success! The Database is now talking to Node.js.');
});

module.exports = db;