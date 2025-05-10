const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('Connected to MySQL server successfully!');
    
    // Try to create the database
    await connection.query('CREATE DATABASE IF NOT EXISTS appointment_system');
    console.log('Database "appointment_system" created or already exists');
    
    // Use the database
    await connection.query('USE appointment_system');
    console.log('Using database "appointment_system"');
    
    // Read the schema file
    const fs = require('fs');
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    
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
    } else {
      console.error('Schema file not found at:', schemaPath);
    }
    
    await connection.end();
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
}

testConnection();
