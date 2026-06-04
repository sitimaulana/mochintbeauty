-- Add fee_terapis column to treatments table
ALTER TABLE `treatments` ADD COLUMN `fee_terapis` DECIMAL(10,2) NOT NULL DEFAULT 0;
