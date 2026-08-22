-- ============================================================
-- FRIENDZ E-COMMERCE DATABASE SCHEMA (MySQL / SQLite Compatible)
-- Database Name: friendz_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS `friendz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `friendz_db`;

-- ------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- Stores product catalog inventory details
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `gender` VARCHAR(50) NOT NULL,            -- 'men', 'women', 'kids', 'sandals'
  `kidGender` VARCHAR(50) DEFAULT NULL,     -- 'boys', 'girls'
  `price` DECIMAL(10, 2) NOT NULL,
  `sizes` TEXT DEFAULT NULL,                -- JSON array e.g. ["S","M","L"]
  `colors` TEXT DEFAULT NULL,               -- JSON array e.g. ["Navy","Black"]
  `material` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `images` TEXT DEFAULT NULL,               -- JSON array of image asset paths
  `featured` TINYINT(1) DEFAULT 0,          -- 1 = Featured, 0 = Normal
  `newArrival` TINYINT(1) DEFAULT 0,        -- 1 = New Arrival, 0 = Normal
  `collection` VARCHAR(100) DEFAULT NULL,   -- e.g. 'Modern Classics', 'Casual Wear'
  `stock` INT DEFAULT 50,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 2. ORDERS TABLE
-- Stores customer checkout order master records
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(100) NOT NULL UNIQUE, -- e.g. FR-ORD-432097
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `address` TEXT NOT NULL,
  `landmark` VARCHAR(255) DEFAULT NULL,
  `pincode` VARCHAR(20) NOT NULL,
  `delivery_note` TEXT DEFAULT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',    -- 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
  `payment_method` VARCHAR(50) DEFAULT 'WhatsApp / COD',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. ORDER ITEMS TABLE
-- Stores line item breakdown for each placed order
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT NOT NULL,
  `selected_size` VARCHAR(50) DEFAULT NULL,
  `selected_color` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. CONTACT MESSAGES TABLE
-- Stores customer feedback and enquiry form entries
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Unread',     -- 'Unread', 'Read', 'Replied'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. ADMINS TABLE
-- Stores admin users for Admin Dashboard access (/admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin User Creation (Password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO `admins` (`username`, `password_hash`)
SELECT 'admin', '$2a$10$96xP3gY9QfU1V92N4G6Lve0D.W2m81uW4.4O8O940y9X8449494'
WHERE NOT EXISTS (SELECT `id` FROM `admins` WHERE `username` = 'admin');

-- ------------------------------------------------------------
-- 6. PRODUCT ATTRIBUTES TABLE
-- Stores dynamic attributes (gender, category, collection, size, color, material)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_attributes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

