const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  try {
    // Create a connection to the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'appointment_system',
      multipleStatements: true
    });

    console.log('Connected to the database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'db', 'update-schema-2.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL statements
    console.log('Executing SQL statements...');
    await connection.query(sql);
    console.log('Database schema updated successfully');

    // Close the connection
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error updating database schema:', error);
  }
}

updateDatabase();
