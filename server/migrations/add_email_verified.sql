-- Add email_verified field to members table
ALTER TABLE members ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER email;

-- Update existing members to have email_verified = TRUE (since they already registered)
UPDATE members SET email_verified = TRUE WHERE id > 0;
