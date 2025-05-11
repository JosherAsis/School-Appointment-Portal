const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function createDatabase() {
  try {
    // Create a connection to MySQL server (without specifying a database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('Connected to MySQL server successfully!');
    
    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS appointment_system');
    console.log('Database "appointment_system" created or already exists');
    
    // Use the database
    await connection.query('USE appointment_system');
    console.log('Using database "appointment_system"');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split the schema into individual statements
      const statements = schema
        .split(';')
        .filter(statement => statement.trim() !== '')
        .map(statement => statement + ';');
      
      // Execute each statement
      for (const statement of statements) {
        try {
          await connection.query(statement);
          console.log('Executed SQL statement successfully');
        } catch (err) {
          console.error('Error executing SQL statement:', err.message);
          console.error('Statement:', statement);
        }
      }
      
      console.log('Schema created successfully!');
      
      // Create default time slots
      console.log('Creating default time slots...');
      
      // Monday to Friday, 9 AM to 4 PM, hourly slots
      for (let day = 1; day <= 5; day++) {
        for (let hour = 9; hour < 16; hour++) {
          const startTime = `${hour}:00:00`;
          const endTime = `${hour + 1}:00:00`;
          
          try {
            await connection.query(
              'INSERT INTO time_slots (day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, TRUE)',
              [day, startTime, endTime]
            );
          } catch (err) {
            // Ignore duplicate entries
            if (!err.message.includes('Duplicate entry')) {
              console.error(`Error creating time slot for day ${day}, time ${startTime}:`, err.message);
            }
          }
        }
      }
      
      console.log('Default time slots created successfully!');
      
      // Create admin user if it doesn't exist
      try {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        // Check if admin exists
        const [adminUsers] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
        
        if (adminUsers.length === 0) {
          // Create admin user
          const [userResult] = await connection.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin User', 'admin@example.com', hashedPassword, 'admin']
          );
          
          console.log('Admin user created successfully!');
        } else {
          console.log('Admin user already exists');
        }
      } catch (err) {
        console.error('Error creating admin user:', err.message);
      }
      
    } else {
      console.error('Schema file not found at:', schemaPath);
    }
    
    await connection.end();
    console.log('Database setup completed successfully!');
  } catch (err) {
    console.error('Error setting up database:', err);
  }
}

createDatabase();
