USE appointment_system;

-- Add reset token fields to users table
ALTER TABLE users
ADD COLUMN reset_token VARCHAR(100) DEFAULT NULL,
ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL;

-- Update appointments table to add cancelled status and cancelled_at field
ALTER TABLE appointments
MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
ADD COLUMN cancelled_at DATETIME DEFAULT NULL;
