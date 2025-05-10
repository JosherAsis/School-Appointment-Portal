const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function updateDatabase() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'appointment_system',
      multipleStatements: true // Allow multiple SQL statements
    });

    console.log('Connected to MySQL database');

    // Read the update script
    const updateScript = fs.readFileSync(path.join(__dirname, 'db', 'update-schema.sql'), 'utf8');

    // Execute the update script
    console.log('Executing database update script...');
    await connection.query(updateScript);
    console.log('Database schema updated successfully');

    // Close the connection
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
}

// Run the update function
updateDatabase();
