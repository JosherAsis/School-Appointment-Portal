const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createTestUser() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'appointment_system'
    });

    console.log('Connected to MySQL database');

    // Check if the test user already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['test@example.com']
    );

    if (existingUsers.length > 0) {
      console.log('Test user already exists. Updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update the user's password
      await connection.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, 'test@example.com']
      );
      
      console.log('Test user password updated successfully');
    } else {
      console.log('Creating new test user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Create the user
      const [userResult] = await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Test User', 'test@example.com', hashedPassword, 'student']
      );
      
      console.log('Test user created successfully with ID:', userResult.insertId);
      
      // Create student profile
      await connection.query(
        'INSERT INTO students (user_id, student_id, department, year_level) VALUES (?, ?, ?, ?)',
        [userResult.insertId, 'TEST123', 'Computer Science', 3]
      );
      
      console.log('Test student profile created successfully');
    }

    // Create an admin user if it doesn't exist
    const [existingAdmins] = await connection.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      ['admin@example.com', 'admin']
    );

    if (existingAdmins.length === 0) {
      console.log('Creating admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create the admin user
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@example.com', hashedPassword, 'admin']
      );
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Close the connection
    await connection.end();
    console.log('Database connection closed');
    
    console.log('\nTest accounts created:');
    console.log('1. Student Account:');
    console.log('   - Email: test@example.com');
    console.log('   - Password: password123');
    console.log('   - Role: student');
    console.log('\n2. Admin Account:');
    console.log('   - Email: admin@example.com');
    console.log('   - Password: admin123');
    console.log('   - Role: admin');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run the function
createTestUser();
