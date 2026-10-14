# Practical 9: User Registration with Input Validation, Bcrypt Password Hashing, and MySQL Relational Insertion

**Course / Module:** ITUE203 - Web Development Frameworks  
**System Name:** Campusly (formerly StudentHub) &bull; CHARUSAT CSPIT  
**Date:** October 14, 2026  
**Points:** 10 Points  

---

## 📋 Problem Definition & Objectives

Design and implement a robust and secure student registration system for the **Campusly** academic portal adhering to enterprise security standards.

The implementation fulfills all 7 evaluation criteria:
1. **Successful User Registration:** Smooth registration flow providing clear feedback and enabling immediate system authentication.
2. **Empty-Field Validation:** Validation to verify all required fields (Full Name, University Email, Department, Password, Confirm Password) are populated prior to processing.
3. **Invalid Email Validation:** Server-side sanitization and validation using PHP's `filter_var($email, FILTER_VALIDATE_EMAIL)` to ensure RFC-compliant email structure.
4. **Password Mismatch Validation:** Comparison check verifying that `password` and `confirm_password` are identical before hashing.
5. **Duplicate Email/Username Validation:** Parameterized check querying the MySQL `users` table to prevent duplicate account registration.
6. **Password Stored in Hashed Format in MySQL Database:** Cryptographic password hashing utilizing PHP `password_hash($password, PASSWORD_DEFAULT)` producing standard 60-character bcrypt (`$2y$`) digests. Plaintext passwords are never stored.
7. **Successful Database Insertion:** Atomic/relational insertion into both the `students` profile table and the `users` authentication table linked by foreign key (`student_id`).

---

## 🔐 Implementation Details

### 1. Database Schema Integration (`schema.sql`)
The registration system targets the `students` and `users` tables:
```sql
-- Students table
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    student_id INT NULL,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_students FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Secure Processing Logic (`register.php`)
```php
// 1. Empty field validation
if (empty($fullname) || empty($email) || empty($password) || empty($confirm)) {
    $errorMessage = 'Validation Error: All fields are required.';
// 2. Email format validation
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errorMessage = 'Validation Error: Invalid email format! Please provide a valid email address.';
// 3. Password mismatch validation
} elseif ($password !== $confirm) {
    $errorMessage = 'Validation Error: Passwords do not match!';
// 4. Password minimum length
} elseif (strlen($password) < 6) {
    $errorMessage = 'Validation Error: Password must be at least 6 characters in length.';
} else {
    // 5. Duplicate account verification
    $checkStmt = $pdo->prepare("SELECT user_id, email, name FROM users WHERE email = :email OR name = :name LIMIT 1");
    $checkStmt->execute([':email' => $email, ':name' => $fullname]);
    if ($checkStmt->fetch()) {
        $errorMessage = 'Validation Error: Duplicate account detected! This email or username is already registered.';
    } else {
        // 6. Cryptographic Password Hashing
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // 7. Successful Database Insertion
        $insertStudent = $pdo->prepare("INSERT INTO students (name, email, course) VALUES (:name, :email, :course)");
        $insertStudent->execute([':name' => $fullname, ':email' => $email, ':course' => $course]);
        $newStudentId = $pdo->lastInsertId();

        $insertUser = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, student_id) VALUES (:name, :email, :hash, 'student', :sid)");
        $insertUser->execute([':name' => $fullname, ':email' => $email, ':hash' => $hashedPassword, ':sid' => $newStudentId]);

        $successMessage = 'Registration Successful! Student record #' . $newStudentId . ' created with securely hashed password in MySQL database.';
    }
}
```

---

## 📸 Practical 9 Verification Screenshots

| # | Criterion | Screenshot File | Description |
|---|---|---|---|
| 1 | Registration Interface | `PRAC SS/Practical 9/01_registration_interface.png` | Clean registration view with all required input fields and badges |
| 2 | Empty-Field Validation | `PRAC SS/Practical 9/02_empty_field_validation.png` | Submitting empty form prompts all fields required alert |
| 3 | Invalid Email Validation | `PRAC SS/Practical 9/03_invalid_email_validation.png` | Malformed email rejected via `filter_var()` |
| 4 | Password Mismatch | `PRAC SS/Practical 9/04_password_mismatch_validation.png` | Mismatched password and confirm password validation |
| 5 | Duplicate Account Check | `PRAC SS/Practical 9/05_duplicate_email_validation.png` | Duplicate email/username prevention alert |
| 6 | Successful Registration | `PRAC SS/Practical 9/06_successful_user_registration.png` | Success banner confirming user record creation |
| 7 | Hashed Password Storage | `PRAC SS/Practical 9/07_database_password_hash_verification.png` | MySQL verification table showing 60-character `$2y$` bcrypt hashes |

---

&copy; 2026 Campusly Portal &bull; CSPIT CHARUSAT.
