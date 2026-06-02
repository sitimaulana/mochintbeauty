-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create product_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `category_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_category` (`product_id`, `category_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Migrate existing category data from products table to categories table
-- Insert unique categories from products.category into categories table
INSERT IGNORE INTO `categories` (name) 
SELECT DISTINCT `category` FROM `products` WHERE `category` IS NOT NULL AND `category` != '';

-- Insert into product_categories junction table
INSERT IGNORE INTO `product_categories` (product_id, category_id)
SELECT p.id, c.id 
FROM `products` p
JOIN `categories` c ON p.category COLLATE utf8mb4_general_ci = c.name COLLATE utf8mb4_general_ci
WHERE p.category IS NOT NULL AND p.category != '';

-- Drop the old category column if needed (optional, keep for backwards compatibility)
-- ALTER TABLE `products` DROP COLUMN `category`;
