# Practical 10: Secure Login/Logout with Sessions, Role-Based Access, Timeout, and Remember-Me Token

**Course / Module:** Web Development & Information Systems Security  
**System Name:** Campusly (formerly StudentHub)  
**Date:** October 12, 2026  
**Session Timeout:** Exactly 10 Minutes (600 seconds)

---

## 📋 Problem Definition & Objectives

Develop secure login and logout functionality using PHP sessions for the **Campusly** academic portal.
1. **Password Verification:** Verify passwords securely using `password_verify()` against salted hashes created by `password_hash()`.
2. **Session Fixation Prevention:** Regenerate session IDs immediately following authentication using `session_regenerate_id(true)`.
3. **Protected Access Guard:** Restrict dashboard access so unauthenticated guest requests are blocked.
4. **Role-Based Redirection (RBAC):** Direct users to their appropriate interfaces based on account role:
   - `admin` &rarr; `admin_dashboard.php`
   - `student` &rarr; `dashboard.php`
   - Non-admin attempts to access admin resources are intercepted and denied (`403` / redirection).
5. **Session Inactivity Timeout:** Enforce strict **10-minute idle session timeout** (600 seconds). After 10 minutes without activity, sessions are invalidated, and users are redirected to `login.php?msg=timeout`.
6. **Intermediate Extension:** Maintain a persistent `last_login` timestamp updated upon each successful login.
7. **Advanced Extension:** Implement secure Remember-Me functionality using cryptographically strong tokens (`random_bytes(32)`), storing only their SHA-256 hash in the database (avoiding custom or insecure JWT-like tokens).

---

## 🔐 Architecture & Key Questions Analysis

### 1. Are sessions started and destroyed securely?
- **Initialization:** `auth.php` executes `session_start()` after enforcing strict cookie parameters:
  - `lifetime = 0` (volatile browser session cookie)
  - `httponly = true` (blocks access from malicious JavaScript via XSS)
  - `samesite = 'Lax'` (mitigates Cross-Site Request Forgery - CSRF)
  - `session.use_only_cookies = 1` and `session.use_strict_mode = 1` (rejects uninitialized session IDs)
- **Destruction (`logout.php`):**
  - Empties the `$_SESSION` superglobal (`$_SESSION = []`).
  - Clears the database-stored `remember_token_hash`.
  - Deletes the `remember_token` cookie and expires the `PHPSESSID` cookie with `time() - 42000`.
  - Executes `session_destroy()`.

### 2. Is `password_verify()` used correctly?
- Passwords are never stored in plaintext. In `schema.sql`, credentials are created using `password_hash($password, PASSWORD_DEFAULT)`.
- Upon submission in `login.php`:
  ```php
  $stmt = $pdo->prepare("SELECT user_id, name, email, password_hash, role, student_id, last_login FROM users WHERE email = :email LIMIT 1");
  $stmt->execute([':email' => $email]);
  $user = $stmt->fetch();

  if ($user && password_verify($password, $user['password_hash'])) {
      // Credentials confirmed
      login_user($user, $remember);
  }
  ```

### 3. Is unauthorized dashboard access blocked?
- Protected entrypoints (`dashboard.php`, `admin_dashboard.php`) invoke `require_login()`.
- If `$_SESSION['user_id']` is absent, the user is redirected to `login.php?msg=unauthorized`.
- If a logged-in student tries to navigate to `admin_dashboard.php`, the system enforces `require_login(['admin'])` and redirects them to `dashboard.php?msg=forbidden`.

### 4. Is session timeout implemented (10 minutes)?
- Constant configured in `auth.php`: `define('SESSION_TIMEOUT_SECONDS', 600);` (10 minutes).
- On every page load, `enforce_session_timeout()` measures:
  ```php
  $inactiveTime = time() - $_SESSION['last_activity'];
  if ($inactiveTime > 600) {
      logout_user('timeout');
      header('Location: login.php?msg=timeout');
      exit;
  }
  $_SESSION['last_activity'] = time();
  ```
- Both dashboards display a **live countdown timer** (e.g. `10:00`), an **Extend Session** button, and a **Test 10m Timeout** quick simulator.

### 5. Are admin and student users redirected to appropriate dashboards?
- In `login.php`, after regenerating session ID:
  ```php
  $destination = ($user['role'] === 'admin') ? 'admin_dashboard.php' : 'dashboard.php';
  header("Location: $destination");
  ```

---

## 🗄️ Database Schema Updates (`schema.sql`)

Table `users` added to the `campusly` database:

```sql
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
```

---

## 🔑 Seeded Test Accounts

| Role | Name | Email Address | Password | Landing Dashboard |
|---|---|---|---|---|
| **Admin** | System Administrator | `admin@campusly.com` | `Admin@123` | `admin_dashboard.php` |
| **Student** | Jay Navadiya | `jaynavadiya@gmail.com` | `Student@123` | `dashboard.php` |
| **Student** | Bhavy Gol | `bhavy123@gmail.com` | `Student@123` | `dashboard.php` |

*(Quick 1-click credential buttons are also embedded directly inside `login.php`.)*

---

## 🚀 Execution & Verification

### 1. Import or Verify Database
```bash
mysql -u root < schema.sql
```

### 2. Start PHP Built-in Server
From the project root:
```bash
php -S localhost:8000
```

### 3. Run Automated End-to-End Test Suite
Run the test verification script:
```bash
php verify_scenarios.php
```
Outputs status checks for:
- Direct unauthorized access attempt (Blocked &rarr; `302`)
- Failed login with wrong password (Rejected)
- Successful student login & redirection (`dashboard.php`)
- Role-Based Access Control (Student blocked from admin dashboard)
- Successful admin login & redirection (`admin_dashboard.php`)
- 10-Minute session timeout expiration
- Complete logout & session destruction

### 4. Interactive Browser Verification
- Open `http://localhost:8000/login.php`
- Open `http://localhost:8000/test_auth.php` for the full visual test report.
