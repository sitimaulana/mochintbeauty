-- Menambahkan kolom untuk admin reply dan featured status
ALTER TABLE `reviews` 
ADD COLUMN `adminId` INT DEFAULT NULL AFTER `userId`,
ADD COLUMN `adminReply` TEXT DEFAULT NULL,
ADD COLUMN `repliedAt` TIMESTAMP DEFAULT NULL,
ADD COLUMN `isFeatured` BOOLEAN DEFAULT FALSE,
ADD COLUMN `isApproved` BOOLEAN DEFAULT TRUE,
ADD FOREIGN KEY (`adminId`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL;

-- Jika sudah ada, gunakan perintah di bawah ini:
-- ALTER TABLE `reviews` 
-- MODIFY COLUMN `adminId` INT DEFAULT NULL,
-- MODIFY COLUMN `adminReply` TEXT DEFAULT NULL,
-- MODIFY COLUMN `repliedAt` TIMESTAMP DEFAULT NULL,
-- MODIFY COLUMN `isFeatured` BOOLEAN DEFAULT FALSE,
-- MODIFY COLUMN `isApproved` BOOLEAN DEFAULT TRUE;
