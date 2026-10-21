import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def create_document():
    doc = docx.Document()

    # Page Margins (0.75 in)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # 1. Header / College Info
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_inst = title_p.add_run("CHANDUBHAI S. PATEL INSTITUTE OF TECHNOLOGY (CSPIT)\nDEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\n")
    run_inst.bold = True
    run_inst.font.size = Pt(13)
    run_inst.font.color.rgb = RGBColor(30, 41, 59)

    run_sub = title_p.add_run("ITUE203 - Web Development Frameworks / Database Systems\n")
    run_sub.bold = True
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = RGBColor(37, 99, 235)

    run_prac = title_p.add_run("PRACTICAL - 12 LABORATORY REPORT\n")
    run_prac.bold = True
    run_prac.font.size = Pt(15)
    run_prac.font.color.rgb = RGBColor(15, 23, 42)

    run_theme = title_p.add_run("Practical 12: Event Management CRUD with Poster Upload and File Validation\n")
    run_theme.italic = True
    run_theme.font.size = Pt(11)
    run_theme.bold = True

    # Student metadata table
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_table.rows[0].cells[0].text = "Student Name: Jay Navadiya"
    meta_table.rows[0].cells[1].text = "Student ID / Roll No: 25CS052"
    meta_table.rows[1].cells[0].text = "Degree / Semester: B.Tech CSE (Div-I)"
    meta_table.rows[1].cells[1].text = "Date of Submission: October 21, 2026"

    for row in meta_table.rows:
        for cell in row.cells:
            set_cell_background(cell, "F1F5F9")
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(3)
                for run in p.runs:
                    run.font.size = Pt(9.5)
                    run.bold = True
                    run.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 1: Aim & Objectives
    h1 = doc.add_heading("1. Aim & Practical Objectives", level=1)
    h1.runs[0].font.color.rgb = RGBColor(37, 99, 235)

    p_aim = doc.add_paragraph()
    p_aim.add_run("AIM: ").bold = True
    p_aim.add_run(
        "To develop a secure and robust event management module (CRUD) for administrative and student users using PHP and MySQL, "
        "incorporating server-side poster file upload, multi-layer file validation (MIME type inspection, allowed extensions, and a 2MB file size ceiling), "
        "cryptographic file renaming, upload directory protection via .htaccess, transactional UI feedback messaging, and role-based access restrictions."
    )

    doc.add_heading("1.1 Course Outcomes (CO) & Problem Definition", level=2)
    p_def = doc.add_paragraph()
    p_def.add_run("Problem Definition: ").bold = True
    p_def.add_run(
        "Develop event management functionality for admin users. Admin can add, view, update, delete, and upload event posters "
        "with file type and file size validation.\n"
    )
    p_def.add_run("CO Mapping: ").bold = True
    p_def.add_run("CO1 (Foundations of Web Systems), CO4 (Server-Side Scripting & Database Integration), CO5 (Secure File Handling & Validation).\n")
    p_def.add_run("Learning Outcome: ").bold = True
    p_def.add_run("Students will implement a secure CRUD module with validated file upload, data sanitization, directory defense, and responsive admin UI.")

    p_obj = doc.add_paragraph()
    p_obj.add_run("Key Deliverables & Specifications:").bold = True
    objectives = [
        ("Complete CRUD Operations", "Implementation of Create (INSERT), Read (SELECT), Update (UPDATE), and Delete (DELETE) actions with relational MySQL data persistence."),
        ("Strict Server-Side File Validation", "Validation of file upload error codes, file extension checking (.jpg, .jpeg, .png, .webp), and file size enforcement (Max 2MB = 2,097,152 bytes)."),
        ("MIME & File Integrity Inspection", "Validation using PHP finfo (FILEINFO_MIME_TYPE) and getimagesize() to defend against spoofed extensions and corrupted payloads."),
        ("Advanced Image Renaming", "Cryptographic, unique hashed timestamp filename generation (poster_<timestamp>_<random>.<ext>) preventing file collisions and path traversal attacks."),
        ("Upload Directory Protection", "Hardening uploads/ directory with .htaccess (php_flag engine off, Options -Indexes -ExecCGI) and index.html to prevent malicious script execution."),
        ("Intermediate Extension", "Real-time search bar and multi-criteria filtering by Category (Technical, Hackathon, Workshop, Cultural, Sports) and Status (Open, Closed)."),
        ("Advanced Extension (Audit Log)", "Relational MySQL audit trail logging all CREATE, UPDATE, and DELETE operations with admin user identifier and timestamp."),
        ("Role-Based Access Control (RBAC)", "Privilege separation ensuring students and unauthenticated guests are restricted from executing administrative event modifications.")
    ]
    for title, desc in objectives:
        p_item = doc.add_paragraph(style='List Bullet')
        p_item.add_run(f"{title}: ").bold = True
        p_item.add_run(desc)

    # Section 2: Technical Architecture & Security Flow
    h2 = doc.add_heading("2. Technical Architecture & File Validation Workflow", level=1)
    h2.runs[0].font.color.rgb = RGBColor(37, 99, 235)

    doc.add_heading("2.1 Three-Tier Server-Side File Upload Validation", level=2)
    doc.add_paragraph(
        "Client-side validation (HTML accept attributes or JavaScript) can easily be bypassed by intercepting HTTP requests. "
        "Therefore, Practical 12 enforces authoritative multi-stage server-side validation in PHP before any database insert or storage operation:\n"
        "1. File Size Ceiling: Enforces a maximum limit of 2MB (2,097,152 bytes). Files exceeding this limit trigger an immediate error banner.\n"
        "2. Whitelisted Extensions: Using pathinfo($name, PATHINFO_EXTENSION), only ['jpg', 'jpeg', 'png', 'webp'] are accepted.\n"
        "3. MIME Verification: Using finfo_file(FILEINFO_MIME_TYPE, $tmp), the server inspects the binary magic bytes, rejecting spoofed files.\n"
        "4. Image Integrity: getimagesize() verifies the dimensions and authentic image structure."
    )

    doc.add_heading("2.2 Defense-in-Depth Directory Security (.htaccess)", level=2)
    doc.add_paragraph(
        "Even if an attacker attempts to upload a malicious script disguised as an image, the uploads/ directory is hardened:\n"
        "• php_flag engine off disables PHP engine execution inside the uploads folder.\n"
        "• Options -Indexes -ExecCGI prohibits directory browsing and script execution.\n"
        "• AddHandler default-handler forces all files to be served strictly as static binary downloads."
    )

    doc.add_heading("2.3 Database Schema (events & event_audit_log)", level=2)
    doc.add_paragraph(
        "The relational database schema models events in Third Normal Form (3NF) and tracks administrative modifications in event_audit_log."
    )

    # Section 3: Complete Source Code
    h3 = doc.add_heading("3. Complete Source Code Implementation", level=1)
    h3.runs[0].font.color.rgb = RGBColor(37, 99, 235)

    files_to_include = [
        ("events.php", "Event Management CRUD, Server-Side Poster Upload & Validation Engine", "/Users/jaynavadiya07/Desktop/Project/events.php"),
        ("uploads/.htaccess", "Upload Directory Protection & Script Execution Guard", "/Users/jaynavadiya07/Desktop/Project/uploads/.htaccess"),
        ("schema_practical12.sql", "MySQL Relational Schema for events & event_audit_log", None)
    ]

    for fname, fdesc, fpath in files_to_include:
        h_code = doc.add_heading(f"3.{files_to_include.index((fname, fdesc, fpath))+1} File: {fname} – {fdesc}", level=2)
        h_code.runs[0].font.color.rgb = RGBColor(15, 23, 42)

        if fname == "schema_practical12.sql":
            code_content = """-- Practical 12: Events and Audit Log Schema
CREATE TABLE IF NOT EXISTS events (
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

-- Advanced Extension: Relational Audit Log Table
CREATE TABLE IF NOT EXISTS event_audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NULL,
    event_name VARCHAR(150) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NULL,
    performed_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""
        else:
            with open(fpath, 'r', encoding='utf-8') as f:
                code_content = f.read()

        p_code = doc.add_paragraph()
        p_code.paragraph_format.space_before = Pt(2)
        p_code.paragraph_format.space_after = Pt(6)
        p_code.paragraph_format.line_spacing = 1.05

        run_code = p_code.add_run(code_content)
        run_code.font.name = "Consolas"
        run_code.font.size = Pt(8.0)
        run_code.font.color.rgb = RGBColor(30, 41, 59)

    # Section 4: Test Report & Execution Screenshots
    h4 = doc.add_heading("4. Test Report & Execution Screenshots", level=1)
    h4.runs[0].font.color.rgb = RGBColor(37, 99, 235)

    doc.add_paragraph(
        "Below are the verified test execution screenshots fulfilling all requirements in the StudentHub Light Theme:"
    )

    screenshots_info = [
        ("01_admin_login_and_dashboard.png", "1. Admin Login and Dashboard", "Verified administrative access to the Executive Control Center in StudentHub Light Theme with KPI cards, navigation, and session timer."),
        ("02_valid_poster_upload.png", "2. Valid Poster Upload & Inspection", "Verified server-side image inspection displaying MIME type 'image/png', dimensions, file size within 2MB, and .htaccess security guard."),
        ("03_add_event_modal_with_poster.png", "3. Add Event Modal with Valid Poster", "Modal form with Event Title, Category, Status, Venue, Date, and poster image selected with live thumbnail preview."),
        ("04_successful_event_creation.png", "4. Successful Event Creation", "Transactional success notification confirming event insertion and validated poster file storage in uploads/posters/."),
        ("05_event_list_with_uploaded_posters.png", "5. Event List with Uploaded Posters", "Master event directory displaying all events with high-resolution poster thumbnails, category tags, venues, and enrollment counters."),
        ("06_edit_event_modal.png", "6. Edit Event Modal", "Prefilled event edit modal displaying existing poster image and inputs to update schedule, venue, and poster replacement."),
        ("07_successful_event_update.png", "7. Successful Event Update", "Transactional success notification confirming successful update of event record."),
        ("08_successful_event_deletion.png", "8. Successful Event Deletion", "Transactional success notification confirming event deletion and unlinking of associated poster file."),
        ("09_invalid_file_type_validation.png", "9. Invalid File Type Validation", "Prominent red alert rejecting unsupported file format (.pdf): 'Only JPG, JPEG, PNG, and WEBP image formats are allowed.'"),
        ("10_file_size_limit_validation.png", "10. File Size Limit Validation", "Prominent red alert rejecting oversized file (> 2MB): 'File size exceeds maximum allowed limit of 2MB (2,097,152 bytes).'"),
        ("11_success_and_error_messages.png", "11. Success and Error Messages Architecture", "Dedicated UI showcase presenting the full spectrum of green success notifications and red validation error banners."),
        ("12_unauthorized_user_access_restriction.png", "12. Unauthorized User Access Restriction", "Role-Based Access Control barrier restricting non-admin students from administrative event operations.")
    ]

    base_ss_dir = "/Users/jaynavadiya07/Desktop/Project/PRAC SS/Practical 12"

    for img_file, title, caption in screenshots_info:
        img_path = os.path.join(base_ss_dir, img_file)
        doc.add_heading(title, level=2)
        p_cap = doc.add_paragraph()
        r_c_bold = p_cap.add_run("Verification Description: ")
        r_c_bold.bold = True
        p_cap.add_run(caption)

        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(4)
            p_img.paragraph_format.space_after = Pt(12)
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=Inches(6.2))
        else:
            p_err = doc.add_paragraph(f"[Image file not found: {img_file}]")
            p_err.runs[0].font.color.rgb = RGBColor(220, 38, 38)

    # Section 5: Conclusion
    h5 = doc.add_heading("5. Viva Questions & Conclusion", level=1)
    h5.runs[0].font.color.rgb = RGBColor(37, 99, 235)

    q_and_a = [
        ("Q1: Why is client-side file validation insufficient for web application security?",
         "A1: Client-side validation (HTML accept or JS) executes in the client browser and can be completely bypassed using HTTP proxies (Burp Suite), cURL, or browser dev tools. Server-side validation is mandatory as the authoritative barrier."),
        ("Q2: Why should file extension check be combined with MIME type and getimagesize()?",
         "A2: Attackers can rename malicious PHP scripts to have a '.png' or '.jpg' extension. Validating MIME type via finfo_file() reads magic bytes, and getimagesize() confirms genuine image raster structure."),
        ("Q3: How does cryptographic renaming prevent Directory Traversal and File Collision?",
         "A3: If users specify filenames like '../../index.php' or duplicate names like 'poster.png', the server could overwrite critical files. Cryptographic renaming (poster_<timestamp>_<random>.<ext>) ensures safe, collision-free storage."),
        ("Q4: What is the purpose of .htaccess inside the uploads directory?",
         "A4: It disables the PHP interpreter (php_flag engine off) and prohibits script execution (Options -ExecCGI) so that even if a file is uploaded, it can never be executed on the server.")
    ]

    for q, a in q_and_a:
        p_q = doc.add_paragraph()
        p_q.add_run(q).bold = True
        p_a = doc.add_paragraph(a)
        p_a.paragraph_format.space_after = Pt(6)

    p_conc = doc.add_paragraph()
    p_conc.add_run("Conclusion: ").bold = True
    p_conc.add_run(
        "Practical 12 was successfully designed, implemented, and rigorously tested. Complete CRUD functionality for campus events, "
        "comprehensive server-side poster upload validation, category/status filtering, and defensive directory hardening "
        "were implemented in full accordance with CSPIT web development guidelines."
    )

    output_path = "/Users/jaynavadiya07/Desktop/Project/25CS052_Prac12.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_document()
