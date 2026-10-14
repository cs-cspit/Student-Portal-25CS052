-- =====================================================================
-- Practical 10: Exported MySQL Database (user_registration.sql)
-- System: Campusly Academic Portal
-- Table: users (Stores user credentials, bcrypt password hashes, and roles)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS campusly
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE campusly;

-- Drop users table if existing to ensure clean import
DROP TABLE IF EXISTS users;

-- Table structure for table `users`
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
-- Note: Passwords are securely hashed using password_hash($password, PASSWORD_DEFAULT)
-- Credentials:
-- Admin:   email: admin@campusly.com   | password: Admin@123
-- Student: email: jay@campusly.com     | password: Student@123
-- Student: email: student@campusly.com | password: Student@123

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `role`, `last_login`, `created_at`) VALUES
(1, 'Administrator', 'admin@campusly.com', '$2y$12$nah.j6ixJ8ZOl33C.6kyouGO3kDb5n.KK.zOJDtTFnslMpmKjImbq', 'admin', NOW(), NOW()),
(2, 'Jay Navadiya', 'jay@campusly.com', '$2y$12$0YY8yE51ZMgUQlbHx8h.AeqEnzcjke5n7E.VAdlKwV8RwPbImdbVO', 'student', NOW(), NOW()),
(3, 'Kavya Patel', 'student@campusly.com', '$2y$12$0YY8yE51ZMgUQlbHx8h.AeqEnzcjke5n7E.VAdlKwV8RwPbImdbVO', 'student', NOW(), NOW()),
(4, 'Bhavy Gol', 'bhavy@campusly.com', '$2y$12$0YY8yE51ZMgUQlbHx8h.AeqEnzcjke5n7E.VAdlKwV8RwPbImdbVO', 'student', NOW(), NOW());
