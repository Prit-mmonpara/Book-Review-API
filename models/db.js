const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,  // This will be 'book_review'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`Database '${process.env.DB_NAME}' does not exist. Please create it first.`);
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Could not connect to MySQL. Make sure MySQL is running.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check your MySQL username and password.');
    } else {
      console.error('Error connecting to the database:', err);
    }
    process.exit(1);
  }
  console.log(`Successfully connected to database: ${process.env.DB_NAME}`);
  connection.release();
});

module.exports = pool.promise(); 