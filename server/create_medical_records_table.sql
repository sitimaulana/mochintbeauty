-- Create medical_records table for storing treatment medical records
CREATE TABLE IF NOT EXISTS medical_records (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `appointment_id` INT NOT NULL,
  `member_id` INT DEFAULT NULL,
  `treatment_name` VARCHAR(100) DEFAULT NULL,
  `medical_notes` LONGTEXT DEFAULT NULL,
  `before_image_url` VARCHAR(500) DEFAULT NULL,
  `after_image_url` VARCHAR(500) DEFAULT NULL,
  `images_json` LONGTEXT DEFAULT NULL COMMENT 'JSON array for multiple before/after images',
  `diagnosis` TEXT DEFAULT NULL COMMENT 'Diagnosis atau kondisi pasien',
  `treatment_detail` TEXT DEFAULT NULL COMMENT 'Detail treatment yang dilakukan',
  `recommendations` TEXT DEFAULT NULL COMMENT 'Rekomendasi perawatan lanjutan',
  `status` ENUM('draft', 'completed') DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_medical_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  
  -- Index for faster queries
  KEY idx_appointment (appointment_id),
  KEY idx_member (member_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
