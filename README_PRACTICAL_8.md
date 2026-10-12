# Practical 8: Campusly Relational Database Design & Secure PHP PDO Implementation

**Course / Module:** Web Development & Database Management Systems  
**System Name:** Campusly (formerly StudentHub)  
**Date:** October 9, 2026  

---

## 📋 Overview & Problem Statement

Design a robust relational database for the **Campusly** platform covering **Students**, **Events**, and **Registrations**. Establish secure database connectivity using **PHP PDO (PHP Data Objects)** with comprehensive `try-catch` error handling and execute all queries using **Prepared Statements** to eliminate SQL injection vulnerabilities.

---

## 🗄️ Relational Schema Design (3NF Normalization)

The database schema `campusly` is divided into three relational tables adhering strictly to **Third Normal Form (3NF)**:

```
+------------------+         +-----------------------+         +------------------+
|     students     |         |     registrations     |         |      events      |
+------------------+         +-----------------------+         +------------------+
| PK student_id    |<---\    | PK registration_id    |    /--->| PK event_id      |
|    student_code  |     \---| FK student_id         |   /     |    title         |
|    first_name    |         | FK event_id           |--/      |    category      |
|    last_name     |         |    registration_date  |         |    event_date    |
|    email         |         |    status             |         |    event_time    |
|    phone         |         |    payment_status     |         |    venue         |
|    department    |         |    attendance_status  |         |    organizer     |
|    semester      |         +-----------------------+         |    department    |
|    created_at    |                                           |    seats_avail   |
+------------------+                                           |    reg_fee       |
                                                               |    status        |
                                                               +------------------+
```

### 1. First Normal Form (1NF) Compliance:
- Every table has a unique primary key (`student_id`, `event_id`, `registration_id`).
- All attributes are **atomic** (e.g., student name is split into `first_name` and `last_name`; dates and times are distinct; single contact phone and email).
- No repeating groups or multivalued columns.

### 2. Second Normal Form (2NF) Compliance:
- Meets all 1NF rules.
- All non-key attributes are fully functionally dependent on the entire primary key.
- Since all primary keys are single-column surrogate keys (`AUTO_INCREMENT`), no partial key dependencies exist.

### 3. Third Normal Form (3NF) Compliance:
- Meets all 2NF rules.
- Eliminates **transitive dependencies**: non-key attributes depend *only* on the primary key, and not on other non-key attributes.
- Student details and Event details are maintained independently; the `registrations` junction table links them via Foreign Keys (`student_id` &rarr; `students.student_id`, `event_id` &rarr; `events.event_id`).
- Unique constraint `uq_student_event_registration(student_id, event_id)` enforces that a student cannot register twice for the same event.

---

## 🔐 Security & Implementation Details

### 1. Secure PDO Connection (`db.php`)
- **Driver Abstraction:** Uses `PDO` for secure cross-platform database interaction.
- **Exception Mode:** `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION` ensures all database errors throw catchable `PDOException` instances.
- **Disabling Emulation:** `PDO::ATTR_EMULATE_PREPARES => false` forces MySQL server to use native binary protocol prepared statements, eliminating SQL injection vectors.
- **Try-Catch Architecture:** Catches connection exceptions gracefully without leaking sensitive credentials to end users.

### 2. Parameterized Prepared Statements (`test_connection.php`)
- Queries utilize placeholders (`:department`, `:event_id`) and parameter binding:
  ```php
  $stmt = $pdo->prepare("SELECT ... FROM registrations r 
                          JOIN students s ON r.student_id = s.student_id 
                          WHERE s.department = :dept");
  $stmt->execute([':dept' => $selectedDept]);
  ```
- Separates SQL code from user-supplied data, preventing SQL Injection by design.

---

## 🚀 Execution Instructions

### 1. Import Database Schema
Run in terminal / MySQL CLI:
```bash
mysql -u root -p < schema.sql
```

### 2. Start PHP Built-in Server
From the project directory:
```bash
php -S localhost:8000
```

### 3. Verify in Browser
- Open `http://localhost:8000/test_connection.php` to view the connection badge and rendered 3NF tables.
- Open `http://localhost:8000/db.php` to verify direct connection parameters.
