-- =====================================================================
-- Practical 8: Campusly 3NF Relational Database Schema
-- Database Name: campusly
-- Tables: students, events, registrations, users
-- =====================================================================

CREATE DATABASE IF NOT EXISTS campusly
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE campusly;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS students;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Table: students (Entity in 3NF)
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: events (Entity in 3NF)
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    venue VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: registrations (Relational Junction in 3NF)
CREATE TABLE registrations (
    reg_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    event_id INT NOT NULL,
    CONSTRAINT fk_reg_students FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reg_events FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: users (Authentication, RBAC, Sessions, Remember-Me)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    student_id INT NULL,
    last_login DATETIME NULL,
    remember_token_hash VARCHAR(64) NULL,
    remember_token_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_students FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- INSERT SEED DATA
-- =====================================================================

-- Students
INSERT INTO students (student_id, name, email, course) VALUES
(1, 'Jay', 'jay@campusly.com', 'CSE'),
(2, 'jayyyy', 'jayyyy@campusly.com', 'CSE');

-- Events
INSERT INTO events (event_id, event_name, venue) VALUES
(1, 'Hackathon', 'Lab 301'),
(2, 'Web Workshop', 'Lab 302'),
(3, 'AI Workshop', 'Auditorium'),
(4, 'AI Seminar', 'Seminar Hall');

-- Registrations (Assigning events to students)
INSERT INTO registrations (reg_id, student_id, event_id) VALUES
(1, 1, 1), -- Jay -> Hackathon (Lab 301)
(2, 2, 2); -- jayyyy -> Web Workshop (Lab 302)

-- Users (Hashed passwords using password_hash(..., PASSWORD_DEFAULT))
-- Passwords:
-- Admin: Admin@123
-- Students: Student@123
INSERT INTO users (user_id, name, email, password_hash, role, student_id, last_login) VALUES
(1, 'Jay', 'jay@campusly.com', '$2y$10$wzNq8/gZf1hE7mJv79i4reQ2l73Vv.1c0U88c/bX6G6g24rMvRsm6', 'student', 1, NOW()),
(2, 'jayyyy', 'jayyyy@campusly.com', '$2y$10$wzNq8/gZf1hE7mJv79i4reQ2l73Vv.1c0U88c/bX6G6g24rMvRsm6', 'student', 2, NOW()),
(3, 'admin', 'admin@campusly.com', '$2y$10$63L4k9t9O/Pj9M2dFq4Eke976tYtK15lZ075s3N7Xz0b62e4W8T9e', 'admin', NULL, NOW());
