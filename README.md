# StudentHub (Campusly) &mdash; Academic Management Portal
### Practical 15: Final Integration, Testing, Documentation, GitHub Submission, and Local Deployment

<p align="center">
  <img src="images/campusly-logo.png" width="96" height="96" alt="Campusly Logo" style="border-radius: 18px; box-shadow: 0 8px 24px rgba(0, 102, 255, 0.35);">
</p>

<p align="center">
  <strong>Learn &bull; Grow &bull; Belong</strong><br>
  <em>Official Next-Generation Academic Gateway for Chandubhai S. Patel Institute of Technology (CSPIT) &bull; CHARUSAT</em><br>
  <strong>Candidate:</strong> Jay Navadiya | <strong>ID:</strong> 25CS052 | <strong>Branch:</strong> B.Tech Computer Science & Engineering
</p>

---

## 🌟 Overview & Problem Definition

**StudentHub** (Campusly) is a production-grade, hardened academic portal built for the **Chandubhai S. Patel Institute of Technology (CSPIT)** at **CHARUSAT**. 

For **Practical 15**, all semester modules have been unified into a single deployable full-stack application:
- Seamless multi-page navigation and dynamic role-based headers/footers
- Dual-role authentication and session statefulness with 10-minute zero-drift inactivity guard
- Strict Role-Based Access Control (RBAC) with HTTP 403 authorization barriers
- Relational 3NF MySQL Database (`studenthub.sql`) with foreign key constraints
- RESTful JSON API (`api.php`) enabling asynchronous AJAX/Fetch CRUD without page reloads
- Real-time administrative controls, user status toggling, and relational security audit logging (`audit_logs`)
- Local deployment support for both **Apache Virtual Hosts (`studenthub.local`)** and PHP built-in server

---

## 🔗 Submission Deliverables Summary

| Deliverable | Description / Location | Link / File Reference |
|---|---|---|
| **1. GitHub Repo Link** | Integrated open-source repository | [github.com/cs-cspit/Student-Portal-25CS052](https://github.com/cs-cspit/Student-Portal-25CS052) |
| **2. Database Dump** | 3NF MySQL database export file | [`studenthub.sql`](studenthub.sql) |
| **3. Documentation** | Complete setup, testing, and deployment guide | [`README.md`](README.md) |
| **4. Test & Security Report** | Comprehensive test matrix, security & accessibility audit | [`TEST_AND_SECURITY_REPORT.md`](TEST_AND_SECURITY_REPORT.md) |
| **5. Screenshots Proof** | High-resolution light theme captures | [`PRAC SS/PRACTICAL 15/`](PRAC%20SS/Practical%2015/) |

---

## 🔍 Key Questions & Architectural Analysis

### 1. Are all pages properly linked and navigable?
Yes. Every module (`index.php`, `login.php`, `register.php`, `dashboard.php`, `student_dashboard.php`, `students.php`, `events.php`, `timetable.php`, `material.php`, `about.php`, `contact.php`) shares a unified navigation header and modern two-pill footer (`includes/header.php`, `includes/footer.php`). Active routes are visually highlighted, breadcrumb trails provide clear hierarchy, and there are zero broken internal links.

### 2. Are sessions, roles, validations, and database operations working end-to-end?
Yes. Sessions utilize `session_regenerate_id(true)` to defeat session fixation, synchronized across tabs via epoch wall-clock timestamps. Role checks strictly isolate the Administrator Control Center from Student features. Dual-layer validation guarantees data hygiene on both client and server before persisting changes to MySQL via prepared statements.

### 3. Are security and accessibility checklists completed?
Yes. The platform passes OWASP security requirements (SQL Injection, Bcrypt password hashing, Cross-Site Scripting HTML-escaping, RBAC 403 interception) and meets WCAG 2.1 Level AA accessibility standards with high-contrast light mode styling, semantic HTML5, explicit labels, and visible keyboard focus rings. Full details are documented in [`TEST_AND_SECURITY_REPORT.md`](TEST_AND_SECURITY_REPORT.md).

### 4. Is project documentation sufficient for installation and testing?
Yes. This `README.md` provides complete, turnkey commands for running the portal via PHP built-in server or configuring an Apache Virtual Host (`studenthub.local`), importing the database, and executing end-to-end test cases.

### 5. Is the project repository clean and properly committed?
Yes. The Git repository is cleanly maintained with `.gitignore` filtering out temporary files, descriptive commit messages, and a synchronized `main` branch hosted on GitHub.

---

## 🔑 Pre-Configured Test Accounts

| Account Name | Role | Email | Password | Access Level |
|---|---|---|---|---|
| **Administrator** | Admin | `admin@campusly.com` | `Admin@123` | Executive Admin Control Center, User Status Toggle, Audit Logs |
| **Jay Navadiya** | Student | `jay@campusly.com` | `Student@123` | Student Dashboard, Enrolled Courses, Event Registrations |
| **Kavya Patel** | Student | `student@campusly.com` | `Student@123` | Student Dashboard & Academic Materials |
| **Bhavy Gol** | Student | `bhavy@campusly.com` | `Student@123` | Student Academic View |

*Users can log in using either their username (`admin`, `jay`, `student`) or their full email address.*

---

## 📂 Project Structure

```
├── README.md                      # Comprehensive Project Documentation
├── TEST_AND_SECURITY_REPORT.md    # Testing, Security & Accessibility Checklist
├── studenthub.sql                 # Complete MySQL 3NF Database Dump
├── apache_studenthub_vhost.conf   # Apache Virtual Host Configuration (Intermediate Extension)
│
├── index.php                      # Portal Home & Module Gateway
├── login.php                      # Authentication Gateway (Student & Admin Tabs)
├── register.php                   # Student Self-Registration with Validation
├── logout.php                     # Secure Session Termination & Cookie Clearing
├── auth.php                       # Authentication Guard, RBAC Engine & Audit Logger
├── db.php                         # Resilient MySQLi & PDO Connection Handler
│
├── dashboard.php                  # Executive Admin Control Center (Practical 14)
├── admin_dashboard.php            # Admin Dashboard Router & Protection Wrapper
├── student_dashboard.php          # Personalized Student Portal & Timetable
├── students.php                   # Student Directory with Live AJAX CRUD (Practical 13)
├── api.php                        # RESTful JSON API Endpoints for CRUD Operations
├── events.php                     # Campus Events Catalog & Junction Registrations
├── timetable.php                  # Weekly Academic Class Schedule
├── material.php                   # Course Syllabus & Resource Downloads
├── about.php                      # About CSPIT, CDPC Placements & CIVF Incubation
├── contact.php                    # Campus Support & Help Desk
│
├── css/
│   └── styles.css                 # Unified Portal CSS, Responsive Grids & Light/Dark Theme
├── js/
│   ├── auth.js                    # Inactivity Timer & Session Warning Modal
│   ├── intro.js                   # Cinematic Monogram Preloader Sequence
│   └── live-bg.js                 # 60 FPS Constellation Particle Engine
├── images/
│   ├── campusly-logo.png          # Official StudentHub Brand Mark
│   └── favicon.png                # Browser Favicon
├── includes/
│   ├── header.php                 # Dynamic Navbar, Role Badges & Session Timer
│   └── footer.php                 # Two-Pill Footer (About Us & Help Center)
└── PRAC SS/
    └── PRACTICAL 15/              # High-Resolution Light Mode Verification Screenshots
```

---

## ⚙️ Installation & Setup Instructions

### Option A: Quick Start via PHP Built-in Server (Recommended for Fast Testing)

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:cs-cspit/Student-Portal-25CS052.git
   cd Student-Portal-25CS052
   ```

2. **Import Database Dump**:
   ```bash
   mysql -u root -p < studenthub.sql
   ```
   *This automatically creates the `studenthub` database with all tables, keys, and test data.*

3. **Start the Local PHP Server**:
   ```bash
   php -S 127.0.0.1:8000
   ```

4. **Access the Application**:
   Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your web browser.

---

### Option B: Local Deployment with Apache Virtual Host (Intermediate Extension)

To deploy locally using Apache (macOS Apache or Windows XAMPP) under the custom domain `http://studenthub.local`:

1. **Include Virtual Host Configuration**:
   Copy the virtual host configuration from [`apache_studenthub_vhost.conf`](apache_studenthub_vhost.conf) into your Apache configuration:
   - **macOS Apache:** `/etc/apache2/extra/httpd-vhosts.conf` or `/opt/homebrew/etc/httpd/extra/httpd-vhosts.conf`
   - **Windows XAMPP:** `C:\xampp\apache\conf\extra\httpd-vhosts.conf`

   ```apache
   <VirtualHost *:80>
       ServerAdmin admin@studenthub.local
       ServerName studenthub.local
       ServerAlias www.studenthub.local
       DocumentRoot "/Users/jaynavadiya07/Desktop/Project"
       <Directory "/Users/jaynavadiya07/Desktop/Project">
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
           DirectoryIndex index.php index.html
       </Directory>
       ErrorLog "/private/var/log/apache2/studenthub_error.log"
       CustomLog "/private/var/log/apache2/studenthub_access.log" combined
   </VirtualHost>
   ```

2. **Update Local DNS (`hosts` file)**:
   Add the domain resolution entry:
   - **macOS / Linux:** `sudo nano /etc/hosts`
   - **Windows:** Open `C:\Windows\System32\drivers\etc\hosts` as Administrator.
   
   Add line:
   ```text
   127.0.0.1 studenthub.local
   ```

3. **Restart Apache Server**:
   - **macOS:** `sudo apachectl restart`
   - **XAMPP:** Click **Stop** then **Start** on the Apache service in the XAMPP Control Panel.

4. **Open Portal**:
   Navigate to [http://studenthub.local](http://studenthub.local).

---

### Option C: Online / Cloud Deployment Architecture (Advanced Extension)

For production deployment to cloud infrastructure:
1. **Frontend / Static Layer**: Can be decoupled and distributed across edge CDNs (Vercel, Netlify, Cloudflare Pages) for near-zero latency.
2. **Backend PHP Engine**: Deployable to any standard Linux container PaaS (Railway, Render, Fly.io, or cPanel/LAMP shared hosting).
3. **Database Layer**: Managed MySQL instance (AWS RDS, PlanetScale, or Aiven MySQL) connected via environment variables (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`).

---

## 🧪 Testing Guide

1. **Verify Home & Navigation**:
   Open [http://127.0.0.1:8000/index.php](http://127.0.0.1:8000/index.php). Verify all navigation links, theme toggle, and hero buttons function properly.
2. **Test Administrator Authentication**:
   Log in with `admin@campusly.com` / `Admin@123`. Observe executive dashboard with live KPIs, dynamic registration analytics, and user status toggling.
3. **Test Student Authentication & RBAC**:
   Log out and log in with `jay@campusly.com` / `Student@123`. Observe student portal with personal enrolled subjects.
4. **Test RBAC 403 Security Interception**:
   While logged in as a student, navigate directly to `http://127.0.0.1:8000/dashboard.php`. Confirm HTTP 403 Access Denied warning is displayed and violation is logged.
5. **Test AJAX CRUD (No Reload)**:
   Navigate to `students.php`. Add a student via modal, search dynamically with instant keystroke debounce, and export CSV.
6. **Test 10-Minute Session Timeout**:
   Observe session countdown timer in the top-right header. Warning modal triggers at 1 minute remaining.

---

## 📑 Semester Practical Progression

- **[Practical 8](README_PRACTICAL_8.md)**: 3NF Relational Database Schema Design & Secure PHP PDO Connection
- **[Practical 9](README_PRACTICAL_9.md)**: User Registration with Input Validation, Bcrypt Password Hashing, and MySQL Relational Insertion
- **[Practical 10](README_PRACTICAL_10.md)**: Secure Login/Logout with Sessions, RBAC, 10-Minute Timeout, and Remember-Me Token
- **[Practical 11](README_PRACTICAL_11.md)**: Student Management CRUD with Search, Filter & CSV Export (`students.php`)
- **[Practical 12](README_PRACTICAL_12.md)**: Event Management CRUD with File Upload and Poster Validation (`events.php`)
- **[Practical 13](README_PRACTICAL_13.md)**: RESTful PHP JSON API and Asynchronous AJAX/Fetch CRUD without Page Reload (`api.php`)
- **[Practical 14](README_PRACTICAL_14.md)**: Dynamic Admin Dashboard, RBAC Menus, Analytics Chart, and Relational Audit Logging
- **Practical 15**: Final Integration, Testing, Documentation, GitHub Submission, and Local Deployment (`studenthub.sql`)

---

<p align="center">
  &copy; 2026 StudentHub (Campusly) &bull; Chandubhai S. Patel Institute of Technology (CSPIT), CHARUSAT.
</p>
