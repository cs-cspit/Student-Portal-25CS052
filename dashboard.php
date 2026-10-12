<?php
/**
 * Practical 10: Student Dashboard (dashboard.php)
 * System: Campusly
 */

$pageTitle = "Student Dashboard - Campusly";
$activePage = "dashboard.php";

require_once __DIR__ . '/auth.php';

// Access Guard: Enforce authenticated student session
// If an administrator accesses this page, redirect to Admin Control Center
if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
    header('Location: admin_dashboard.php');
    exit;
}
require_login(['student']);

// Fetch user information from database
$stmt = $pdo->prepare("SELECT user_id, name, email, role, student_id, last_login FROM users WHERE user_id = :uid LIMIT 1");
$stmt->execute([':uid' => $_SESSION['user_id']]);
$currentUser = $stmt->fetch();

$userName  = $currentUser['name'] ?? $_SESSION['user_name'];
$userEmail = $currentUser['email'] ?? $_SESSION['user_email'];
$userRole  = ucfirst($currentUser['role'] ?? $_SESSION['role']);
$lastLogin = !empty($currentUser['last_login']) 
    ? date('d M Y, h:i:s A', strtotime($currentUser['last_login'])) 
    : 'First login today';

require_once __DIR__ . '/includes/header.php';
?>

  <!-- Breadcrumbs -->
  <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
    <ol class="breadcrumbs">
      <li><a href="index.php">Home</a></li>
      <li aria-current="page">Student Dashboard</li>
    </ol>
  </nav>

  <!-- Main Content Area -->
  <main id="main-content">

    <?php if (isset($_GET['msg']) && $_GET['msg'] === 'forbidden'): ?>
      <div class="alert alert-danger" style="background: #fef2f2; color: #991b1b; border: 1px solid #f87171; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;" role="alert">
        <strong>⚠️ Access Denied:</strong> Administrative privileges required. Access to Admin Dashboard was blocked.
      </div>
    <?php endif; ?>

<?php
$initials = strtoupper(substr($userName, 0, 1) . (strpos($userName, ' ') !== false ? substr($userName, strpos($userName, ' ') + 1, 1) : ''));
?>
    <!-- Executive User & Session Profile Card -->
    <div class="executive-profile-card student-card">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #fff; font-weight: 800; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
          <?= htmlspecialchars($initials) ?>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.25rem; flex-wrap: wrap;">
            <h2 class="executive-profile-name" style="font-size: 1.2rem;"><?= htmlspecialchars($userName) ?></h2>
            <span style="background: rgba(37, 99, 235, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
              <?= htmlspecialchars($userRole) ?>
            </span>
            <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #22c55e; font-weight: 600; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.25); padding: 2px 8px; border-radius: 9999px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span>
              Active Session
            </span>
          </div>
          <div class="executive-profile-meta">
            <span>✉️ <code><?= htmlspecialchars($userEmail) ?></code></span>
            <span>🕒 Last Login: <strong><?= htmlspecialchars($lastLogin) ?></strong></span>
            <span>🔐 Session: <code><?= htmlspecialchars(substr(session_id(), 0, 10)) ?>...</code></span>
          </div>
        </div>
      </div>

      <div>
        <a href="logout.php" class="btn btn-primary" style="font-size: 0.88rem; background: #dc2626; border: none; border-radius: 8px; padding: 0.55rem 1.1rem; display: inline-flex; align-items: center; gap: 6px;">
          <span>⎋</span> Log Out
        </a>
      </div>
    </div>

    <div class="alert alert-info" role="alert">
      <span><strong>Notice:</strong> The Midterm examination schedule is now finalized. Check your exam slots under <a href="timetable.php" style="color: inherit; text-decoration: underline;">timetable</a>.</span>
    </div>

    <section class="panel" aria-labelledby="dash-welcome">
      <h1 id="dash-welcome">Welcome back, <?= htmlspecialchars($userName) ?>!</h1>
      <p>CHARUSAT | Department of Computer Science & Engineering | Semester III (Odd Term) | Division I</p>
      <div style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <a href="timetable.php" class="btn btn-primary">Check Timetable</a>
        <a href="material.php" class="btn btn-secondary">Download Materials</a>
        <a href="profile.php" class="btn btn-secondary">Update Profile</a>
        <?php if ($_SESSION['role'] === 'admin'): ?>
          <a href="admin_dashboard.php" class="btn btn-primary" style="background: #be185d;">Go to Admin Dashboard</a>
        <?php endif; ?>
      </div>
    </section>

    <!-- Student Progress Summary -->
    <div class="grid-cols-3" style="margin-bottom: 2rem;">
      <article class="panel" style="margin-bottom: 0; text-align: center;" aria-labelledby="stat-cpi">
        <h3 id="stat-cpi">Current CPI / SGPA</h3>
        <p style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-bottom: 0;">9.15</p>
        <span style="font-size: 0.85rem; color: var(--text-muted);">Active academic score roll</span>
      </article>
      <article class="panel" style="margin-bottom: 0; text-align: center;" aria-labelledby="stat-attendance">
        <h3 id="stat-attendance">Overall Attendance</h3>
        <p style="font-size: 2.2rem; font-weight: 800; color: var(--success); margin-bottom: 0;">91.5%</p>
        <span style="font-size: 0.85rem; color: var(--text-muted);">Minimum required: 80.0%</span>
      </article>
      <article class="panel" style="margin-bottom: 0; text-align: center;" aria-labelledby="stat-credits">
        <h3 id="stat-credits">Completed Credits</h3>
        <p style="font-size: 2.2rem; font-weight: 800; color: var(--accent); margin-bottom: 0;">42 / 180</p>
        <span style="font-size: 0.85rem; color: var(--text-muted);">B.Tech Program requirements</span>
      </article>
    </div>

    <div class="grid-cols-2">
      <!-- Alerts & Notifications -->
      <section class="panel" aria-labelledby="notifications-heading">
        <h2 id="notifications-heading">Notifications</h2>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
          <li style="border-bottom: 1px solid var(--panel-border); padding-bottom: 0.75rem;">
            <p style="margin-bottom: 0.25rem; font-weight: 600; color: var(--text-main);">WDF Lab Assignment Submission</p>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Web Development Frameworks practical project is due tomorrow by 11:59 PM.</span>
          </li>
          <li style="border-bottom: 1px solid var(--panel-border); padding-bottom: 0.75rem;">
            <p style="margin-bottom: 0.25rem; font-weight: 600; color: var(--text-main);">Club Event Registration</p>
            <span style="font-size: 0.85rem; color: var(--text-muted);">Coding Club's annual Hackathon registrations close tonight. <a href="events.php" style="color: var(--primary);">Register now</a>.</span>
          </li>
          <li>
            <p style="margin-bottom: 0.25rem; font-weight: 600; color: var(--text-main);">Library Book Overdue</p>
            <span style="font-size: 0.85rem; color: var(--error);">"Discrete Mathematics and Its Applications" is overdue by 2 days.</span>
          </li>
        </ul>
      </section>

      <!-- Active Courses Summary -->
      <section class="panel" aria-labelledby="courses-heading">
        <h2 id="courses-heading">Active Courses</h2>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
          <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.75rem;">
            <div>
              <p style="margin-bottom: 0; font-weight: 600; color: var(--text-main);">Web Development Frameworks (ITUE204)</p>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Credits: 3+2 (T+P) | Code Reference: CSE-ITUE204</span>
            </div>
            <span style="background: rgba(37, 99, 235, 0.1); color: var(--primary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">Attendance: 92%</span>
          </li>
          <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.75rem;">
            <div>
              <p style="margin-bottom: 0; font-weight: 600; color: var(--text-main);">Data Structures & Algorithms (CSUC201)</p>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Credits: 3+1 (T+P) | Code Reference: CSE-CSUC201</span>
            </div>
            <span style="background: rgba(37, 99, 235, 0.1); color: var(--primary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">Attendance: 88%</span>
          </li>
          <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.75rem;">
            <div>
              <p style="margin-bottom: 0; font-weight: 600; color: var(--text-main);">Computer Networks (ITUC201)</p>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Credits: 4+1 (T+P) | Code Reference: CSE-ITUC201</span>
            </div>
            <span style="background: rgba(37, 99, 235, 0.1); color: var(--primary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem;">Attendance: 91%</span>
          </li>
          <li style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="margin-bottom: 0; font-weight: 600; color: var(--text-main);">Object Oriented Programming (CEUE203)</p>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Credits: 2+1 (T+P) | Code Reference: CSE-CEUE203</span>
            </div>
            <span style="background: rgba(22, 163, 74, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; color: var(--success);">Attendance: 95%</span>
          </li>
        </ul>
      </section>
    </div>

    <div class="next-step-panel">
      <div class="next-step-content">
        <h3>Check Your Class Schedule</h3>
        <p>Review the active CHARUSAT Semester III Computer Science timetable.</p>
      </div>
      <div>
        <a href="timetable.php" class="btn btn-primary">View Timetable</a>
      </div>
    </div>
  </main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
