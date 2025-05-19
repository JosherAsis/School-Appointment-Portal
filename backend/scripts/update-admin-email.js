/**
 * Script to update the admin email from admin@example.com to admin@gmail.com
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function updateAdminEmail() {
  let connection;
  
  try {
    // Create a connection to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'appointment_system'
    });

    console.log('Connected to MySQL database');

    // Update admin email
    console.log('Updating admin email...');
    const [adminUpdateResult] = await connection.query(
      'UPDATE users SET email = ? WHERE email = ? AND role = ?',
      ['admin@gmail.com', 'admin@example.com', 'admin']
    );

    if (adminUpdateResult.affectedRows > 0) {
      console.log(`Admin email updated successfully (${adminUpdateResult.affectedRows} row affected)`);
    } else {
      console.log('No admin user found with email admin@example.com');
    }

    console.log('Admin email update completed');
  } catch (error) {
    console.error('Error updating admin email:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
updateAdminEmail();
