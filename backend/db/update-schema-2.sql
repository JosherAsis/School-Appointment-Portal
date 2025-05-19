USE appointment_system;

-- Add updated_at column to appointments table
ALTER TABLE appointments
ADD COLUMN updated_at DATETIME DEFAULT NULL;
