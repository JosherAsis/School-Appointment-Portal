/**
 * Script to update the database schema for account deletion functionality
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function updateSchema() {
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

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../db/update-schema-deletion.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Split the SQL file into individual statements
    const statements = sql.split(';').filter(statement => statement.trim() !== '');

    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement);
      console.log('Executed SQL statement successfully');
    }

    console.log('Database schema updated successfully for account deletion functionality');
  } catch (error) {
    console.error('Error updating database schema:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the update
updateSchema();
