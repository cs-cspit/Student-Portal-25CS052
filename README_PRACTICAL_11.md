# Practical 11: Student Management CRUD with Search and Filter

**Course / Module:** Web Development Frameworks & Database Systems  
**System Name:** Campusly  
**Date:** October 12, 2026  

---

## 📋 Problem Definition & Objectives

Create a student management module (`students.php`) to add, view, edit, delete, search and filter student records. All database operations must use parameterized MySQL queries and display clear success/failure messages.

1. **Complete CRUD Operations:**
   - **Create (INSERT):** Add new student records with form validation and duplicate email verification.
   - **Read (SELECT):** View all enrolled students in a styled data table.
   - **Update (UPDATE):** Edit student details (name, email, course) with pre-filled inputs.
   - **Delete (DELETE):** Permanently remove records with an explicit client confirmation dialog.
2. **Search Capability:** Real-time search by student name or email using parameterized `LIKE` queries.
3. **Department Filtering:** Filter student listings by academic departments (`CSE`, `CE`, `IT`, `EC`).
4. **Intermediate Extension:** One-click CSV Export functionality using PHP `fputcsv()`.
5. **Seeded Data:** Minimum 20 student records seeded in the `students` table.

---

## 🔐 Implementation Details

- **File:** `students.php`
- **Database Table:** `students` (Fields: `student_id`, `name`, `email`, `course`)
- **Query Protection:** Executed via PDO prepared statements to completely eliminate SQL injection.
- **UI Architecture:** Styled according to the Campusly design system with dark/light mode support.

---

&copy; 2026 Campusly Portal &bull; CHARUSAT CSPIT.
