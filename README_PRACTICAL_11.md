# Practical 11: Student Management CRUD with Search and Filter

**Course / Module:** Web Development Frameworks & Database Systems  
**Student Name:** Jay Navadiya  
**Student ID / Roll No:** 25CS052  
**Institute:** Chandubhai S. Patel Institute of Technology (CSPIT), CHARUSAT  
**Date:** October 16, 2026  

---

## 📋 Problem Definition & Objectives

Create a student management module ([`students.php`](file:///Users/jaynavadiya07/Desktop/Project/students.php)) to add, view, edit, delete, search and filter student records. All database operations must use MySQLi prepared statements and display clear success/failure messages.

### Core Deliverables:
1. **CRUD Operations:**
   - **Create (INSERT):** Add new student records with form validation and duplicate email verification using MySQLi prepared statements.
   - **Read (SELECT):** View all enrolled students in a styled table with 20+ seeded records.
   - **Update (UPDATE):** Edit student details (name, email, course, status) with pre-filled inputs.
   - **Delete Confirmation:** Display confirmation dialog/modal before execution.
2. **Search Capability:** Real-time search by student name or email using parameterized `LIKE` queries.
3. **Course-wise Filtering:** Filter student listings by academic departments (`CSE`, `CE`, `IT`, `EC`).
4. **Intermediate Extension:** One-click CSV Export functionality using PHP `fputcsv()` output stream opened in Excel.
5. **Advanced Extension:** Soft delete implementation using a `status` column (`Active` / `Inactive`) preserving data integrity.
6. **SQL Dump:** Clean schema and seeded records dump submitted in [`practical11_students_dump.sql`](file:///Users/jaynavadiya07/Desktop/Project/PRAC SS/Practical%2011/practical11_students_dump.sql).

---

## 📸 Verified Test Report Screenshots (`PRAC SS -> Practical 11`)

All required screenshots have been captured in high-resolution (Retina 2x scale, white theme) and saved to [`PRAC SS/Practical 11`](file:///Users/jaynavadiya07/Desktop/Project/PRAC%20SS/Practical%2011):

| # | Filename | Description & Verification |
|---|----------|----------------------------|
| 1 | `01_student_records_table.png` | **Student records displayed in a table:** 20+ seeded student records showing ID, Name, Email, Department, Status (Active badge), and Actions. |
| 2 | `02_add_student_modal.png` | **Add New Student Modal:** Interactive form pre-filled with new student data, course dropdown, and initial status. |
| 3 | `03_add_student_success.png` | **Successful addition of a new student:** Green operation success notice confirming student record insertion into MySQL database. |
| 4 | `04_search_functionality.png` | **Search functionality:** Real-time search query filtering records by student name and email using MySQLi prepared statements. |
| 5 | `05_course_wise_filtering.png` | **Course-wise filtering:** Department filter applied (e.g. IT) restricting catalog display to specific academic branch. |
| 6 | `06_edit_student_modal.png` | **Edit Student Modal:** Pre-filled edit form allowing modification of student details and status. |
| 7 | `07_edit_student_success.png` | **Successful update of student details:** Green notification confirming update and reflected in table. |
| 8 | `08_delete_confirmation_message.png` | **Delete confirmation message:** Warning modal requiring explicit administrator confirmation before deactivating record. |
| 9 | `09_successful_soft_delete.png` | **Successful soft delete:** Student record marked as `● Inactive` with status badge changed and `🔄 Reactivate` action button visible. |
| 10 | `10_success_error_messages.png` | **Success/error messages:** Red error notification demonstrating validation handling on duplicate or invalid input. |
| 11 | `11_exported_csv_opened_in_excel.png` | **Exported CSV file opened in Excel:** `campusly_students.csv` opened in Microsoft Excel with formatted columns and active status. |

---

## 🗄️ Deliverables Summary

- **Web Module:** [`students.php`](file:///Users/jaynavadiya07/Desktop/Project/students.php)
- **Database Connection:** [`db.php`](file:///Users/jaynavadiya07/Desktop/Project/db.php) (MySQLi object-oriented `$conn`)
- **Database Schema & Dump:** [`practical11_students_dump.sql`](file:///Users/jaynavadiya07/Desktop/Project/PRAC SS/Practical%2011/practical11_students_dump.sql)
- **Exported CSV:** [`campusly_students.csv`](file:///Users/jaynavadiya07/Desktop/Project/PRAC%20SS/Practical%2011/campusly_students.csv)
- **Word Laboratory Report:** [`25CS052_Prac11.docx`](file:///Users/jaynavadiya07/Desktop/Project/25CS052_Prac11.docx)
- **Screenshot Directory:** [`PRAC SS/Practical 11`](file:///Users/jaynavadiya07/Desktop/Project/PRAC%20SS/Practical%2011)

---
&copy; 2026 Campusly Portal &bull; CHARUSAT CSPIT &bull; Jay Navadiya (25CS052)
