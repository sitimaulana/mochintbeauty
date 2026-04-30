-- Add reminder columns to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS reminder_hours_before INT DEFAULT 2;

-- Create index untuk faster queries saat mencari appointments yang belum reminder
CREATE INDEX IF NOT EXISTS idx_reminder_status ON appointments(reminder_sent, status);
CREATE INDEX IF NOT EXISTS idx_appointment_datetime ON appointments(date, time);
