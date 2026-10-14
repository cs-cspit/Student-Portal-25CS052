<?php
/**
 * Practical 11: Student Management CRUD with Search and Filter
 * System: Campusly
 * Features:
 * - Full CRUD: Add, View, Edit, Delete with confirmation
 * - Real-time Search by Name / Email
 * - Course Filter (All, CSE, CE, IT, EC)
 * - Clear Success & Error Feedback Messages
 * - CSV Export functionality (Intermediate Extension)
 * - Prepared Statements via PDO
 */

$pageTitle = "Student Management (CRUD) - Campusly";
$activePage = "students.php";

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

// Authentication: Accessible to logged in users (admin has full CRUD, student can view)
$isLoggedIn = is_logged_in();
$userRole   = $_SESSION['role'] ?? 'guest';

$feedbackMsg  = '';
$feedbackType = 'success';

// Handle CSV Export
if (isset($_GET['action']) && $_GET['action'] === 'export_csv') {
    if (!$isLoggedIn) {
        header('Location: login.php');
        exit;
    }
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=campusly_students_' . date('Y-m-d') . '.csv');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['Student ID', 'Full Name', 'University Email', 'Course / Department']);
    $stmt = $pdo->query("SELECT student_id, name, email, course FROM students ORDER BY student_id ASC");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, $row);
    }
    fclose($output);
    exit;
}

// Handle POST actions (Create, Update, Delete)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // 1. ADD STUDENT
    if ($action === 'add') {
        $name   = trim($_POST['name'] ?? '');
        $email  = trim($_POST['email'] ?? '');
        $course = trim($_POST['course'] ?? 'CSE');

        if (empty($name) || empty($email) || empty($course)) {
            $feedbackMsg = 'All fields (Name, Email, Course) are required.';
            $feedbackType = 'error';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $feedbackMsg = 'Please provide a valid email address.';
            $feedbackType = 'error';
        } else {
            try {
                $chk = $pdo->prepare("SELECT student_id FROM students WHERE email = :email LIMIT 1");
                $chk->execute([':email' => $email]);
                if ($chk->fetch()) {
                    $feedbackMsg = 'A student with email ' . htmlspecialchars($email) . ' already exists.';
                    $feedbackType = 'error';
                } else {
                    $ins = $pdo->prepare("INSERT INTO students (name, email, course) VALUES (:name, :email, :course)");
                    $ins->execute([':name' => $name, ':email' => $email, ':course' => $course]);
                    $newId = $pdo->lastInsertId();
                    $feedbackMsg = "Student record #$newId ('$name') was successfully created!";
                }
            } catch (PDOException $e) {
                $feedbackMsg = 'Database error: ' . $e->getMessage();
                $feedbackType = 'error';
            }
        }
    }

    // 2. EDIT STUDENT
    elseif ($action === 'edit') {
        $studentId = (int)($_POST['student_id'] ?? 0);
        $name      = trim($_POST['name'] ?? '');
        $email     = trim($_POST['email'] ?? '');
        $course    = trim($_POST['course'] ?? 'CSE');

        if ($studentId <= 0 || empty($name) || empty($email) || empty($course)) {
            $feedbackMsg = 'Invalid input for student record update.';
            $feedbackType = 'error';
        } else {
            try {
                $chk = $pdo->prepare("SELECT student_id FROM students WHERE email = :email AND student_id != :id LIMIT 1");
                $chk->execute([':email' => $email, ':id' => $studentId]);
                if ($chk->fetch()) {
                    $feedbackMsg = 'Email address is already in use by another student.';
                    $feedbackType = 'error';
                } else {
                    $upd = $pdo->prepare("UPDATE students SET name = :name, email = :email, course = :course WHERE student_id = :id");
                    $upd->execute([':name' => $name, ':email' => $email, ':course' => $course, ':id' => $studentId]);
                    $feedbackMsg = "Student #$studentId ('$name') details updated successfully!";
                }
            } catch (PDOException $e) {
                $feedbackMsg = 'Database error: ' . $e->getMessage();
                $feedbackType = 'error';
            }
        }
    }

    // 3. DELETE STUDENT
    elseif ($action === 'delete') {
        $studentId = (int)($_POST['student_id'] ?? 0);
        if ($studentId <= 0) {
            $feedbackMsg = 'Invalid student ID specified for deletion.';
            $feedbackType = 'error';
        } else {
            try {
                $del = $pdo->prepare("DELETE FROM students WHERE student_id = :id");
                $del->execute([':id' => $studentId]);
                $feedbackMsg = "Student record #$studentId was permanently deleted.";
            } catch (PDOException $e) {
                $feedbackMsg = 'Delete failed: ' . $e->getMessage();
                $feedbackType = 'error';
            }
        }
    }
}

// Search and Filter logic
$searchQuery  = trim($_GET['search'] ?? '');
$courseFilter = trim($_GET['course'] ?? '');

$sql = "SELECT student_id, name, email, course FROM students WHERE 1=1";
$params = [];

if ($searchQuery !== '') {
    $sql .= " AND (name LIKE :search_name OR email LIKE :search_email)";
    $params[':search_name'] = "%$searchQuery%";
    $params[':search_email'] = "%$searchQuery%";
}

if ($courseFilter !== '' && $courseFilter !== 'ALL') {
    $sql .= " AND course = :course";
    $params[':course'] = $courseFilter;
}

$sql .= " ORDER BY student_id ASC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);
$totalCount = count($students);

// Get available courses for filter dropdown
$coursesList = ['CSE', 'CE', 'IT', 'EC'];

require_once __DIR__ . '/includes/header.php';
?>

  <!-- Breadcrumbs -->
  <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
    <ol class="breadcrumbs">
      <li><a href="index.php">Home</a></li>
      <?php if ($userRole === 'admin'): ?>
        <li><a href="admin_dashboard.php">Admin Control Center</a></li>
      <?php else: ?>
        <li><a href="dashboard.php">Dashboard</a></li>
      <?php endif; ?>
      <li aria-current="page">Student Management (Practical 11 CRUD)</li>
    </ol>
  </nav>

  <!-- Main Content Area -->
  <main id="main-content">
    <div style="max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem;">

      <!-- Header & Intro Banner -->
      <section class="panel" style="padding: 1.75rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 102, 255, 0.08); padding: 4px 12px; border-radius: 9999px; margin-bottom: 0.5rem; border: 1px solid rgba(0, 102, 255, 0.2);">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0066ff; letter-spacing: 1px;">PRACTICAL 11 MODULE</span>
          </div>
          <h1 style="margin: 0; font-size: 1.8rem; line-height: 1.2;">Student Management (CRUD &amp; Filter)</h1>
          <p style="margin: 0.35rem 0 0 0; color: #64748b; font-size: 0.92rem;">
            Add, View, Edit, Delete, Search, and Filter student records with parameterized MySQL queries.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary" onclick="openAddModal()" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>+ Add New Student</span>
          </button>
          <a href="students.php?action=export_csv" class="btn btn-secondary" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Export to CSV</span>
          </a>
        </div>
      </section>

      <!-- Feedback Toast Notification -->
      <?php if (!empty($feedbackMsg)): ?>
        <div class="auth-notification <?= $feedbackType === 'error' ? 'auth-notification-error' : 'auth-notification-success' ?>" style="margin-bottom: 1.5rem; animation: slideInDown 0.35s ease;" role="alert">
          <div class="auth-notif-icon">
            <?php if ($feedbackType === 'error'): ?>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <?php else: ?>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <?php endif; ?>
          </div>
          <div class="auth-notif-body">
            <strong><?= $feedbackType === 'error' ? 'Error' : 'Success' ?></strong>
            <p><?= htmlspecialchars($feedbackMsg) ?></p>
          </div>
        </div>
      <?php endif; ?>

      <!-- Search & Course Filter Controls -->
      <section class="panel" style="padding: 1.25rem; margin-bottom: 1.5rem;">
        <form action="students.php" method="GET" style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; flex: 1; min-width: 280px;">
            <div style="flex: 2; min-width: 200px; position: relative;">
              <input type="text" name="search" value="<?= htmlspecialchars($searchQuery) ?>" placeholder="🔍 Search student name or email..." style="width: 100%; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
            </div>
            <div style="flex: 1; min-width: 140px;">
              <select name="course" style="width: 100%; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
                <option value="ALL">All Departments</option>
                <?php foreach ($coursesList as $c): ?>
                  <option value="<?= $c ?>" <?= $courseFilter === $c ? 'selected' : '' ?>><?= $c ?></option>
                <?php endforeach; ?>
              </select>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1.25rem;">Apply Filter</button>
            <?php if (!empty($searchQuery) || !empty($courseFilter)): ?>
              <a href="students.php" class="btn btn-secondary" style="padding: 0.6rem 1rem;">Reset</a>
            <?php endif; ?>
          </div>
        </form>
      </section>

      <!-- Students Table Panel -->
      <section class="panel" style="padding: 1.5rem; overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="margin: 0; font-size: 1.2rem;">Enrolled Students Catalog</h2>
          <span style="font-size: 0.85rem; font-weight: 600; color: #64748b; background: rgba(148, 163, 184, 0.12); padding: 4px 10px; border-radius: 9999px;">
            Showing <?= (int)$totalCount ?> Student<?= $totalCount === 1 ? '' : 's' ?>
          </span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.92rem;">
            <thead>
              <tr style="background: var(--table-th-bg, #f8fafc); border-bottom: 2px solid var(--panel-border); text-align: left;">
                <th style="padding: 0.85rem 1rem;">ID</th>
                <th style="padding: 0.85rem 1rem;">Student Name</th>
                <th style="padding: 0.85rem 1rem;">University Email</th>
                <th style="padding: 0.85rem 1rem;">Department</th>
                <th style="padding: 0.85rem 1rem; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php if (empty($students)): ?>
                <tr>
                  <td colspan="5" style="text-align: center; padding: 2.5rem 1rem; color: #64748b;">
                    No student records matching your search query. <a href="students.php" style="color: var(--primary); font-weight: 600;">Reset filters</a>
                  </td>
                </tr>
              <?php else: ?>
                <?php foreach ($students as $s): ?>
                  <tr style="border-bottom: 1px solid var(--panel-border); transition: background 0.15s ease;">
                    <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--primary);">
                      #<?= htmlspecialchars($s['student_id']) ?>
                    </td>
                    <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-main);">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #0066ff, #00d2fe); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
                          <?= strtoupper(substr($s['name'], 0, 1)) ?>
                        </span>
                        <span><?= htmlspecialchars($s['name']) ?></span>
                      </div>
                    </td>
                    <td style="padding: 0.85rem 1rem; color: var(--text-muted);">
                      <?= htmlspecialchars($s['email']) ?>
                    </td>
                    <td style="padding: 0.85rem 1rem;">
                      <span style="padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; background: rgba(0, 102, 255, 0.08); color: #0066ff; border: 1px solid rgba(0, 102, 255, 0.2);">
                        <?= htmlspecialchars($s['course']) ?>
                      </span>
                    </td>
                    <td style="padding: 0.85rem 1rem; text-align: center;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button type="button" class="btn" onclick="openEditModal(<?= htmlspecialchars(json_encode($s)) ?>)" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; background: rgba(56, 189, 248, 0.12); color: #0284c7; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 6px;">
                          ✏️ Edit
                        </button>
                        <form action="students.php" method="POST" style="margin: 0; display: inline;" onsubmit="return confirm('Are you sure you want to delete student #<?= (int)$s['student_id'] ?> (<?= htmlspecialchars(addslashes($s['name'])) ?>)? This action cannot be undone.');">
                          <input type="hidden" name="action" value="delete">
                          <input type="hidden" name="student_id" value="<?= (int)$s['student_id'] ?>">
                          <button type="submit" class="btn" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 6px;">
                            🗑️ Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  </main>

  <!-- ADD STUDENT MODAL -->
  <div id="modal-add-student" style="display: none; position: fixed; inset: 0; background: rgba(11, 25, 76, 0.65); backdrop-filter: blur(4px); z-index: 100000; align-items: center; justify-content: center;">
    <div style="background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 16px; width: 90%; max-width: 480px; padding: 2rem; box-shadow: var(--card-shadow); animation: fadeIn 0.25s ease;">
      <h3 style="margin-top: 0; margin-bottom: 1.25rem; font-size: 1.3rem;">Add New Student</h3>
      <form action="students.php" method="POST">
        <input type="hidden" name="action" value="add">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">Full Name</label>
          <input type="text" name="name" placeholder="e.g. Aarav Patel" required style="width: 100%; padding: 0.55rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">University Email</label>
          <input type="email" name="email" placeholder="e.g. 25cs003@charusat.edu.in" required style="width: 100%; padding: 0.55rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
        </div>
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">Course / Department</label>
          <select name="course" required style="width: 100%; padding: 0.55rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
            <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
            <option value="CE">Computer Engineering (CE)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="EC">Electronics &amp; Communication (EC)</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn-secondary" onclick="closeAddModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">+ Save Student Record</button>
        </div>
      </form>
    </div>
  </div>

  <!-- EDIT STUDENT MODAL -->
  <div id="modal-edit-student" style="display: none; position: fixed; inset: 0; background: rgba(11, 25, 76, 0.65); backdrop-filter: blur(4px); z-index: 100000; align-items: center; justify-content: center;">
    <div style="background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 16px; width: 90%; max-width: 480px; padding: 2rem; box-shadow: var(--card-shadow); animation: fadeIn 0.25s ease;">
      <h3 style="margin-top: 0; margin-bottom: 1.25rem; font-size: 1.3rem;">Edit Student Record</h3>
      <form action="students.php" method="POST">
        <input type="hidden" name="action" value="edit">
        <input type="hidden" id="edit_student_id" name="student_id" value="">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">Full Name</label>
          <input type="text" id="edit_name" name="name" required style="width: 100%; padding: 0.55rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
        </div>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">University Email</label>
          <input type="email" id="edit_email" name="email" required style="width: 100%; padding: 0.55rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
        </div>
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">Course / Department</label>
          <select id="edit_course" name="course" required style="width: 100%; padding: 0.55rem; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--input-bg); color: var(--text-main);">
            <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
            <option value="CE">Computer Engineering (CE)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="EC">Electronics &amp; Communication (EC)</option>
          </select>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Update Record</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function openAddModal() {
      const modal = document.getElementById('modal-add-student');
      modal.style.display = 'flex';
    }
    function closeAddModal() {
      document.getElementById('modal-add-student').style.display = 'none';
    }
    function openEditModal(student) {
      document.getElementById('edit_student_id').value = student.student_id;
      document.getElementById('edit_name').value = student.name;
      document.getElementById('edit_email').value = student.email;
      document.getElementById('edit_course').value = student.course;
      document.getElementById('modal-edit-student').style.display = 'flex';
    }
    function closeEditModal() {
      document.getElementById('modal-edit-student').style.display = 'none';
    }
  </script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
