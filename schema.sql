-- =====================================================================
-- Practical 8: StudentHub 3NF Relational Database Schema
-- Database Name: studenthub
-- Tables: students, events, registrations
-- =====================================================================

CREATE DATABASE IF NOT EXISTS studenthub
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE studenthub;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
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

-- =====================================================================
-- INSERT SEED DATA
-- =====================================================================

-- Students
INSERT INTO students (student_id, name, email, course) VALUES
(1, 'Jay Navadiya', 'jaynavadiya@gmail.com', 'CSE'),
(2, 'Bhavy Gol', 'bhavy123@gmail.com', 'CE'),
(3, 'Vraj Viradiya', 'vrajvv@gmail.com', 'IT'),
(4, 'Rudra Vaghasiya', 'rudravaghasiya@gmail.com', 'CE'),
(5, 'Fenil Finava', 'ff@gmail.com', 'CSE');

-- Events
INSERT INTO events (event_id, event_name, venue) VALUES
(1, 'Hackathon', 'Lab 301'),
(2, 'Web Workshop', 'Lab 302'),
(3, 'AI Workshop', 'Auditorium'),
(4, 'AI Seminar', 'Seminar Hall');

-- Registrations (Assigning events to students)
INSERT INTO registrations (reg_id, student_id, event_id) VALUES
(1, 1, 1), -- Jay Navadiya -> Hackathon (Lab 301)
(2, 2, 2), -- Bhavy Gol -> Web Workshop (Lab 302)
(3, 3, 3), -- Vraj Viradiya -> AI Workshop (Auditorium)
(4, 4, 1), -- Rudra Vaghasiya -> Hackathon (Lab 301)
(5, 5, 4); -- Fenil Finava -> AI Seminar (Seminar Hall)
