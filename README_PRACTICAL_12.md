# Practical 12: Event Management CRUD with Poster Upload and File Validation

**Course / Module:** Web Development Frameworks & Database Systems  
**System Name:** Campusly (StudentHub)  
**Date:** October 21, 2026  
**Author:** Jay Navadiya (25CS052)  
**Theme:** Light Theme (StudentHub)  

---

## 📋 Problem Definition & Objectives

Develop a comprehensive campus event management module (`events.php`) for administrative and student users. Administrators can add, view, update, delete, and upload official event posters with strict server-side file type and file size validation.

1. **Complete CRUD Operations:**
   - **Create (INSERT):** Add new events with mandatory fields (Title, Venue, Date, Category, Status) and an uploaded poster image.
   - **Read (SELECT):** View all campus events in a structured light-themed data table featuring poster thumbnails, category tags, venue, date, and registration metrics.
   - **Update (UPDATE):** Edit event details with pre-populated inputs and optional poster replacement (safely unlinking old poster files).
   - **Delete (DELETE):** Permanently remove events with client confirmation dialog, deleting the database record and unlinking the poster from the file system.
2. **Server-Side Poster Upload & File Validation:**
   - **Allowed MIME Types:** `image/jpeg`, `image/png`, `image/webp`.
   - **Allowed Extensions:** `.jpg`, `.jpeg`, `.png`, `.webp`.
   - **File Size Limit:** Strict 2MB (2,097,152 bytes) limit enforced with clear red alert feedback.
   - **MIME & Integrity Verification:** Server verifies actual file contents via PHP `finfo` and `getimagesize()` to prevent spoofed file extensions.
3. **Role-Based Access Control (RBAC):**
   - **Administrator:** Full administrative CRUD capabilities and poster management.
   - **Student:** Read-only access to browse and register for campus events.
   - **Guest / Unauthorized:** Access denied and redirected to login with notice.
4. **Intermediate Extension:**
   - Real-time search by Title, Venue, or Description.
   - Category filtering (`Technical`, `Hackathon`, `Workshop`, `Cultural`, `Sports`).
   - Status filtering (`Open`, `Closed`).
5. **Advanced Extension:**
   - **Cryptographic File Renaming:** Generates collision-resistant unique names (`poster_<timestamp>_<hash>.<ext>`) preventing directory traversal and filename collision.
   - **Upload Directory Protection:** Configured with `.htaccess` (`php_flag engine off`, `Options -Indexes -ExecCGI`) and `index.html` to eliminate script execution and unauthorized browsing.
   - **Audit Logging:** Logs all administrative operations into MySQL `event_audit_log` tracking event changes with timestamps and admin username.

---

## 📸 Captured Practical 12 Screenshots (`PRAC SS/Practical 12`)

All screenshots captured at 2x Retina resolution (3200 x 2100) strictly in **Light Theme**:

| # | Screenshot Filename | Description |
|---|---|---|
| 1 | `01_admin_login_and_dashboard.png` | Admin login gateway & Executive Control Center dashboard in light theme |
| 2 | `02_valid_poster_upload.png` | Poster Lightbox Inspector displaying verified MIME, dimensions, and file size within 2MB limit |
| 3 | `03_add_event_modal_with_poster.png` | Add Event modal prefilled with details and valid poster image selected |
| 4 | `04_successful_event_creation.png` | Green success alert for newly created event with validated poster upload |
| 5 | `05_event_list_with_uploaded_posters.png` | Master event directory displaying all events with high-resolution poster thumbnails and category tags |
| 6 | `06_edit_event_modal.png` | Edit Event modal prefilled with existing event details and poster replacement option |
| 7 | `07_successful_event_update.png` | Green success alert confirming successful event modification |
| 8 | `08_successful_event_deletion.png` | Green success alert confirming permanent event deletion and poster unlinking |
| 9 | `09_invalid_file_type_validation.png` | Red validation alert rejecting unsupported `.pdf` file upload |
| 10 | `10_file_size_limit_validation.png` | Red validation alert rejecting oversized file (> 2MB limit) |
| 11 | `11_success_and_error_messages.png` | Comprehensive showcase of system success notifications and error validation banners |
| 12 | `12_unauthorized_user_access_restriction.png` | Role-Based Access Control restriction blocking unauthorized student action |

---

## 🗄️ MySQL Database Schema

```sql
-- Events Entity Table
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    venue VARCHAR(100) NOT NULL,
    poster VARCHAR(255) NULL,
    event_date DATE NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Technical',
    status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Advanced Extension: Event Audit Log Table
CREATE TABLE event_audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NULL,
    event_name VARCHAR(150) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NULL,
    performed_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

&copy; 2026 Campusly Portal &bull; CHARUSAT CSPIT &bull; StudentHub.
