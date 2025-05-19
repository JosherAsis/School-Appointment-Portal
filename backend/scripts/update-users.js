/**
 * Script to update users in the database:
 * 1. Update admin email from admin@example.com to admin@gmail.com
 * 2. Remove test users (keeping admin and users created through registration)
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function updateUsers() {
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

    // 1. Update admin email
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

    // 2. Get list of test users to remove
    // We'll identify test users as those with email containing "test" or "example.com"
    // but exclude the admin user
    console.log('Identifying test users to remove...');
    const [testUsers] = await connection.query(
      'SELECT id, name, email, role FROM users WHERE (email LIKE ? OR email LIKE ?) AND role != "admin"',
      ['%test%', '%example.com%']
    );

    if (testUsers.length === 0) {
      console.log('No test users found to remove');
    } else {
      console.log(`Found ${testUsers.length} test users to remove:`);
      testUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email}), role: ${user.role}`);
      });

      // Get the IDs of test users
      const testUserIds = testUsers.map(user => user.id);

      // 3. Remove test users
      // First, delete related student records (due to foreign key constraints)
      const [studentDeleteResult] = await connection.query(
        'DELETE FROM students WHERE user_id IN (?)',
        [testUserIds]
      );
      console.log(`Deleted ${studentDeleteResult.affectedRows} student records`);

      // Then delete the user records
      const [userDeleteResult] = await connection.query(
        'DELETE FROM users WHERE id IN (?)',
        [testUserIds]
      );
      console.log(`Deleted ${userDeleteResult.affectedRows} test user accounts`);
    }

    console.log('User update completed successfully');
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
updateUsers();
