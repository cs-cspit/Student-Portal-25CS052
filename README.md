# Campusly &mdash; Academic Portal

<p align="center">
  <img src="images/campusly-logo.png" width="96" height="96" alt="Campusly Logo" style="border-radius: 18px; box-shadow: 0 8px 24px rgba(0, 102, 255, 0.35);">
</p>

<p align="center">
  <strong>Learn &bull; Grow &bull; Belong</strong><br>
  <em>Official Next-Generation Academic Gateway for Chandubhai S. Patel Institute of Technology (CSPIT) &bull; CHARUSAT</em>
</p>

---

## 🌟 Overview

**Campusly** is a hardened, production-ready academic portal designed and developed for the **Chandubhai S. Patel Institute of Technology (CSPIT)** at **Charotar University of Science and Technology (CHARUSAT)**. 

The platform integrates secure PHP authentication, 3NF relational database architecture, role-based access control (RBAC), an epoch-based 10-minute session inactivity guard, dynamic student CRUD operations, and an aesthetic dark/light interface with a live constellation particle background.

---

## 🚀 Key Portal Features

1. **Cinematic Starting Intro**:
   - Monogram logo pop with ambient halo glow.
   - Expanding laser accent line and staggered brand slogan reveal (*LEARN • GROW • BELONG*).
   - Auto-dismisses smoothly or skips on click/Escape.

2. **Live Animated Constellation Background**:
   - Hardware-accelerated 60 FPS HTML5 Canvas engine with drifting celestial nodes and dynamic connection strands.
   - Interactive cursor gravitational response.
   - Smooth theme-synchronization: High-Contrast Midnight Obsidian (`#092328`) with electric cyan & aquamarine accents, and clean Light mode.
   - 0% idle CPU usage via Page Visibility API.

3. **10-Minute Zero-Drift Session Security (Practical 10)**:
   - High-precision wall-clock epoch timestamping with cross-tab `localStorage` synchronization.
   - Automatic 60-second warning modal with 1-click extension.
   - Automatic server and client session termination after 10 minutes of inactivity.

4. **Role-Based Access Control (RBAC)**:
   - **Student Dashboard** (`dashboard.php`): Student details, active courses, timetable schedules, registered events.
   - **Admin Control Center** (`admin_dashboard.php`): System user management, role toggling, password resets, and event monitoring.
   - Unauthorized guest or cross-role requests are strictly intercepted and blocked.

5. **Student Management CRUD & Filter (Practical 11)**:
   - Complete CRUD operations: Add, View, Edit, and Delete student records with confirmation prompts.
   - Real-time search by student name and email.
   - Course/Department filter (CSE, CE, IT, EC).
   - Instant CSV data export (`fputcsv`).

6. **Hardened Security & 3NF Database (Practical 8 & 9)**:
   - Passwords cryptographically hashed via `password_hash(..., PASSWORD_DEFAULT)` using bcrypt (`$2y$`). Plaintext is never stored.
   - Native PDO prepared statements (`PDO::ATTR_EMULATE_PREPARES => false`) to eliminate SQL injection.
   - Duplicate email validation on registration.
   - Session fixation prevention via `session_regenerate_id(true)`.

---

## 🔑 Pre-Configured Test Accounts

| Account Name | Role | Email | Password | Access Level |
|---|---|---|---|---|
| **Jay** | Student | `jay@campusly.com` | `Student@123` | Student Dashboard & Materials |
| **jayyyy** | Student | `jayyyy@campusly.com` | `Student@123` | Student Dashboard & Materials |
| **admin** | Admin | `admin@campusly.com` | `Admin@123` | Executive Admin Control Center |

*Users can log in using either their username (`Jay`, `jayyyy`, `admin`) or their full email address.*

---

## 📂 Project Structure

```
├── index.php                  # Campusly Home Page & Features
├── login.php                  # Authentication Gateway (Login & Register)
├── logout.php                 # Secure Session & Cookie Invalidation
├── dashboard.php              # Student Academic Dashboard
├── admin_dashboard.php        # Executive Admin Control Center
├── students.php               # Student Management CRUD with Search & Filter (Prac 11)
├── timetable.php              # Academic Course Timetables
├── material.php               # Study Materials & Syllabus Repository
├── events.php                 # Campus Events & Registration Junctions
├── profile.php                # Student Profile Management
├── about.php                  # About CSPIT, CDPC Placements & CIVF Incubation
├── contact.php                # Campus Support & Help Center
├── auth.php                   # Core Session Engine & Security Guards
├── db.php                     # PDO Connection with Error Handling
├── schema.sql                 # 3NF MySQL Database Schema & Seed Data
├── css/
│   └── styles.css             # Unified Campusly Design, Dark Theme (#092328), Grid
├── js/
│   ├── auth.js                # Frontend Session Timer & Client Logic
│   ├── intro.js               # Cinematic Intro Preloader Sequence
│   └── live-bg.js             # Live Constellation Particle Engine
├── images/
│   ├── campusly-logo.png      # Official Campusly Brand Mark
│   └── favicon.png            # Browser Favicon
└── includes/
    ├── header.php             # Unified Navigation Header & Session Timeout Widget
    └── footer.php             # Modern Two-Pill Footer (About Us & Help)
```

---

## 📑 Practical Coverage

- **[Practical 8](README_PRACTICAL_8.md)**: 3NF Relational Database Schema Design & Secure PHP PDO Implementation
- **[Practical 10](README_PRACTICAL_10.md)**: Secure Login/Logout with Sessions, RBAC, 10-Minute Timeout, and Remember-Me Token
- **Practical 11**: Student Management CRUD with Search and Filter (`students.php`)

---

## ⚙️ Setup & Installation

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:cs-cspit/Student-Portal-25CS052.git
   cd Student-Portal-25CS052
   ```

2. **Import Database**:
   ```bash
   mysql -u root -p < schema.sql
   ```

3. **Start Local PHP Server**:
   ```bash
   php -S 0.0.0.0:8000
   ```
   Open `http://localhost:8000` in any web browser.

---

<p align="center">
  &copy; 2026 Campusly Portal &bull; Chandubhai S. Patel Institute of Technology (CSPIT), CHARUSAT.
</p>
