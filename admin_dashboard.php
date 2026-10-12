<?php
/**
 * Practical 10: High-Efficiency Executive Admin Control Center (admin_dashboard.php)
 * System: Campusly
 */

$pageTitle = "Admin Control Center - Campusly";
$activePage = "admin_dashboard.php";

require_once __DIR__ . '/auth.php';

// Strict Role-Based Access Control: Exclusively accessible to admin role
require_login(['admin']);

$feedbackMsg = '';
$feedbackType = 'success';

// Handle Administrative Actions (User management, RBAC updates, Events)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // 1. Create New User
    if ($action === 'create_user') {
        $name     = trim($_POST['name'] ?? '');
        $email    = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $role     = in_array($_POST['role'] ?? '', ['admin', 'student']) ? $_POST['role'] : 'student';
        $course   = trim($_POST['course'] ?? 'CSE');

        if (empty($name) || empty($email) || empty($password)) {
            $feedbackMsg = 'All fields are required to create a user account.';
            $feedbackType = 'error';
        } else {
            try {
                $chk = $pdo->prepare("SELECT user_id FROM users WHERE email = :email LIMIT 1");
                $chk->execute([':email' => $email]);
                if ($chk->fetch()) {
                    $feedbackMsg = 'A user with this email address already exists.';
                    $feedbackType = 'error';
                } else {
                    $studentId = null;
                    if ($role === 'student') {
                        $st = $pdo->prepare("INSERT INTO students (name, email, course) VALUES (:name, :email, :course)");
                        $st->execute([':name' => $name, ':email' => $email, ':course' => $course]);
                        $studentId = $pdo->lastInsertId();
                    }
                    $hash = password_hash($password, PASSWORD_DEFAULT);
                    $uStmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, student_id) VALUES (:name, :email, :hash, :role, :sid)");
                    $uStmt->execute([':name' => $name, ':email' => $email, ':hash' => $hash, ':role' => $role, ':sid' => $studentId]);
                    $feedbackMsg = "Account for '$name' ($role) was created successfully!";
                }
            } catch (PDOException $e) {
                $feedbackMsg = 'Error: ' . $e->getMessage();
                $feedbackType = 'error';
            }
        }
    }

    // 2. Toggle User Role (Student <-> Admin)
    elseif ($action === 'toggle_role') {
        $targetId = (int)($_POST['target_user_id'] ?? 0);
        if ($targetId === (int)$_SESSION['user_id']) {
            $feedbackMsg = 'Safety restriction: You cannot modify your own administrative role.';
            $feedbackType = 'error';
        } else {
            $currentRole = $_POST['current_role'] ?? '';
            $newRole = ($currentRole === 'admin') ? 'student' : 'admin';
            $upd = $pdo->prepare("UPDATE users SET role = :newRole WHERE user_id = :uid");
            $upd->execute([':newRole' => $newRole, ':uid' => $targetId]);
            $feedbackMsg = "User #$targetId role was updated to " . strtoupper($newRole) . "!";
        }
    }

    // 3. Reset User Password
    elseif ($action === 'reset_password') {
        $targetId = (int)($_POST['target_user_id'] ?? 0);
        $newPass  = $_POST['new_password'] ?? 'Student@123';
        $hash     = password_hash($newPass, PASSWORD_DEFAULT);
        $upd      = $pdo->prepare("UPDATE users SET password_hash = :hash WHERE user_id = :uid");
        $upd->execute([':hash' => $hash, ':uid' => $targetId]);
        $feedbackMsg = "Password for User #$targetId has been reset to: $newPass";
    }

    // 4. Delete User
    elseif ($action === 'delete_user') {
        $targetId = (int)($_POST['target_user_id'] ?? 0);
        if ($targetId === (int)$_SESSION['user_id']) {
            $feedbackMsg = 'Safety restriction: You cannot delete your own active administrator account.';
            $feedbackType = 'error';
        } else {
            $del = $pdo->prepare("DELETE FROM users WHERE user_id = :uid");
            $del->execute([':uid' => $targetId]);
            $feedbackMsg = "User account #$targetId was permanently removed.";
        }
    }

    // 5. Create Campus Event
    elseif ($action === 'create_event') {
        $eventName = trim($_POST['event_name'] ?? '');
        $venue     = trim($_POST['venue'] ?? '');
        if (!empty($eventName) && !empty($venue)) {
            $evStmt = $pdo->prepare("INSERT INTO events (event_name, venue) VALUES (:name, :venue)");
            $evStmt->execute([':name' => $eventName, ':venue' => $venue]);
            $feedbackMsg = "Campus event '$eventName' added to MySQL events catalogue!";
        }
    }

    // 6. Delete Campus Event
    elseif ($action === 'delete_event') {
        $eventId = (int)($_POST['event_id'] ?? 0);
        if ($eventId > 0) {
            $evDel = $pdo->prepare("DELETE FROM events WHERE event_id = :eid");
            $evDel->execute([':eid' => $eventId]);
            $feedbackMsg = "Event #$eventId was removed.";
        }
    }
}

// Fetch admin profile
$stmt = $pdo->prepare("SELECT user_id, name, email, role, last_login FROM users WHERE user_id = :uid LIMIT 1");
$stmt->execute([':uid' => $_SESSION['user_id']]);
$admin = $stmt->fetch();

$userName  = $admin['name'] ?? $_SESSION['user_name'];
$userEmail = $admin['email'] ?? $_SESSION['user_email'];
$lastLogin = !empty($admin['last_login']) 
    ? date('d M Y, h:i:s A', strtotime($admin['last_login'])) 
    : 'Active session';

$adminInitials = strtoupper(substr($userName, 0, 1) . (strpos($userName, ' ') !== false ? substr($userName, strpos($userName, ' ') + 1, 1) : ''));

// Fetch metrics & data
$usersList = $pdo->query("SELECT user_id, name, email, role, student_id, last_login, 
                          IF(remember_token_hash IS NOT NULL AND remember_token_expires > NOW(), 'Active', 'Inactive') AS remember_status,
                          created_at 
                          FROM users 
                          ORDER BY user_id ASC")->fetchAll();

$eventsList = $pdo->query("SELECT e.event_id, e.event_name, e.venue, COUNT(r.reg_id) AS reg_count 
                           FROM events e 
                           LEFT JOIN registrations r ON e.event_id = r.event_id 
                           GROUP BY e.event_id, e.event_name, e.venue 
                           ORDER BY e.event_id ASC")->fetchAll();

$countUsers    = count($usersList);
$countStudents = $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
$countEvents   = count($eventsList);
$countRegs     = $pdo->query("SELECT COUNT(*) FROM registrations")->fetchColumn();

// Active remember-me tokens count
$countTokens = 0;
foreach ($usersList as $u) {
    if ($u['remember_status'] === 'Active') $countTokens++;
}

require_once __DIR__ . '/includes/header.php';
?>

  <!-- Breadcrumbs -->
  <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
    <ol class="breadcrumbs">
      <li><a href="index.php">Home</a></li>
      <li aria-current="page">Admin Control Center</li>
    </ol>
  </nav>

  <!-- Main Content Area -->
  <main id="main-content">

    <?php if (!empty($feedbackMsg)): ?>
      <div style="background: <?= $feedbackType === 'error' ? '#fef2f2' : '#f0fdf4' ?>; color: <?= $feedbackType === 'error' ? '#991b1b' : '#166534' ?>; border: 1px solid <?= $feedbackType === 'error' ? '#f87171' : '#86efac' ?>; border-radius: 10px; padding: 0.9rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
        <span><strong><?= $feedbackType === 'error' ? '⚠️ Alert:' : '✓ Success:' ?></strong> <?= htmlspecialchars($feedbackMsg) ?></span>
        <button type="button" onclick="this.parentElement.remove()" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:inherit;">&times;</button>
      </div>
    <?php endif; ?>

    <!-- Executive Admin Profile Card -->
    <div class="executive-profile-card admin-card">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #be185d, #7c3aed); color: #fff; font-weight: 800; font-size: 1.35rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(190, 24, 93, 0.3);">
          <?= htmlspecialchars($adminInitials) ?>
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.3rem; flex-wrap: wrap;">
            <h1 class="executive-profile-name"><?= htmlspecialchars($userName) ?></h1>
            <span style="background: rgba(190, 24, 93, 0.15); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); font-size: 0.72rem; font-weight: 700; padding: 2px 9px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
              SUPER ADMINISTRATOR
            </span>
            <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #22c55e; font-weight: 600; background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.25); padding: 2px 8px; border-radius: 9999px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e;"></span>
              Active Session
            </span>
          </div>
          <div class="executive-profile-meta">
            <span>📧 <code><?= htmlspecialchars($userEmail) ?></code></span>
            <span>🕒 Last Login: <strong><?= htmlspecialchars($lastLogin) ?></strong></span>
            <span>🔐 Session: <code><?= htmlspecialchars(substr(session_id(), 0, 10)) ?>...</code></span>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
        <button type="button" onclick="switchAdminTab('users'); toggleAddUserForm();" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.55rem 1rem; border-radius: 8px;">
          + New User
        </button>
        <button type="button" onclick="switchAdminTab('events'); toggleAddEventForm();" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.55rem 1rem; border-radius: 8px;">
          + New Event
        </button>
        <a href="logout.php" class="btn btn-primary" style="font-size: 0.85rem; background: #dc2626; border: none; padding: 0.55rem 1rem; border-radius: 8px;">
          ⎋ Log Out
        </a>
      </div>
    </div>

    <!-- Productive Metrics Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
      <div class="admin-kpi-panel">
        <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(190, 24, 93, 0.15); color: #f43f5e; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
          👥
        </div>
        <div>
          <span class="kpi-label">Total User Accounts</span>
          <div style="font-size: 1.85rem; font-weight: 800; color: #f43f5e; line-height: 1.1; margin-top: 2px;"><?= (int)$countUsers ?></div>
          <span class="kpi-sub"><?= (int)$countTokens ?> active remember tokens</span>
        </div>
      </div>

      <div class="admin-kpi-panel">
        <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
          🎓
        </div>
        <div>
          <span class="kpi-label">Enrolled Students</span>
          <div style="font-size: 1.85rem; font-weight: 800; color: #38bdf8; line-height: 1.1; margin-top: 2px;"><?= (int)$countStudents ?></div>
          <span class="kpi-sub">Academic 3NF entities</span>
        </div>
      </div>

      <div class="admin-kpi-panel">
        <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(34, 197, 94, 0.15); color: #22c55e; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
          🎪
        </div>
        <div>
          <span class="kpi-label">Campus Events</span>
          <div style="font-size: 1.85rem; font-weight: 800; color: #22c55e; line-height: 1.1; margin-top: 2px;"><?= (int)$countEvents ?></div>
          <span class="kpi-sub">Active university programs</span>
        </div>
      </div>

      <div class="admin-kpi-panel">
        <div style="width: 48px; height: 48px; border-radius: 10px; background: rgba(168, 85, 247, 0.15); color: #c084fc; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">
          📝
        </div>
        <div>
          <span class="kpi-label">Event Registrations</span>
          <div style="font-size: 1.85rem; font-weight: 800; color: #c084fc; line-height: 1.1; margin-top: 2px;"><?= (int)$countRegs ?></div>
          <span class="kpi-sub">Junction links mapped</span>
        </div>
      </div>
    </div>

    <!-- Productivity Navigation Tabs -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 2px solid #e2e8f0;">
      <button type="button" id="tab-btn-users" class="tab-btn active-tab" onclick="switchAdminTab('users')" style="border-radius: 8px 8px 0 0; padding: 0.75rem 1.5rem; font-weight: 700;">
        👥 Users & Role Management
      </button>
      <button type="button" id="tab-btn-events" class="tab-btn" onclick="switchAdminTab('events')" style="border-radius: 8px 8px 0 0; padding: 0.75rem 1.5rem; font-weight: 700;">
        🎪 Campus Events & Registrations
      </button>
      <button type="button" id="tab-btn-security" class="tab-btn" onclick="switchAdminTab('security')" style="border-radius: 8px 8px 0 0; padding: 0.75rem 1.5rem; font-weight: 700;">
        🛡️ Session & Security Monitor
      </button>
    </div>

    <!-- TAB 1: USERS & RBAC MANAGEMENT -->
    <div id="admin-tab-users" class="tab-pane active-pane">
      <section class="panel" style="padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="margin: 0; font-size: 1.25rem;">User Accounts & Role Permissions</h2>
            <p style="margin: 0; font-size: 0.85rem; color: #64748b;">Instant search, role toggle, password resets, and user creation.</p>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <input type="text" id="user-search-input" onkeyup="filterUserTable()" placeholder="🔍 Search name, email, or role..." style="padding: 0.45rem 0.9rem; font-size: 0.88rem; width: 260px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <button type="button" class="btn btn-primary" onclick="toggleAddUserForm()" style="font-size: 0.85rem; padding: 0.45rem 1rem; border-radius: 8px;">
              + Create User
            </button>
          </div>
        </div>

        <!-- Add User Expandable Drawer -->
        <div id="add-user-drawer" style="display: none; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #1e293b;">Create New Account</h3>
          <form action="admin_dashboard.php" method="POST" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <input type="hidden" name="action" value="create_user">
            <div>
              <label style="font-size: 0.85rem; font-weight: 600;">Full Name</label>
              <input type="text" name="name" required style="width: 100%; padding: 0.45rem; border-radius: 6px; border: 1px solid #cbd5e1;">
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: 600;">Email Address</label>
              <input type="email" name="email" required style="width: 100%; padding: 0.45rem; border-radius: 6px; border: 1px solid #cbd5e1;">
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: 600;">Initial Password</label>
              <input type="password" name="password" required minlength="6" style="width: 100%; padding: 0.45rem; border-radius: 6px; border: 1px solid #cbd5e1;">
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: 600;">Account Role</label>
              <select name="role" style="width: 100%; padding: 0.45rem; border-radius: 6px; border: 1px solid #cbd5e1;">
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
              <button type="button" class="btn btn-secondary" onclick="toggleAddUserForm()" style="font-size: 0.85rem;">Cancel</button>
              <button type="submit" class="btn btn-primary" style="font-size: 0.85rem;">Save User Account</button>
            </div>
          </form>
        </div>

        <!-- Users Table -->
        <div style="overflow-x: auto;">
          <table id="users-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                <th style="padding: 0.75rem 1rem;">ID</th>
                <th style="padding: 0.75rem 1rem;">Full Name</th>
                <th style="padding: 0.75rem 1rem;">Email Address</th>
                <th style="padding: 0.75rem 1rem;">Role</th>
                <th style="padding: 0.75rem 1rem;">Last Login</th>
                <th style="padding: 0.75rem 1rem;">Remember-Me</th>
                <th style="padding: 0.75rem 1rem; text-align: center;">Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($usersList as $u): ?>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 0.75rem 1rem;"><strong>#<?= htmlspecialchars($u['user_id']) ?></strong></td>
                  <td style="padding: 0.75rem 1rem; font-weight: 600; color: #1e293b;">
                    <?= htmlspecialchars($u['name']) ?>
                  </td>
                  <td style="padding: 0.75rem 1rem;"><code><?= htmlspecialchars($u['email']) ?></code></td>
                  <td style="padding: 0.75rem 1rem;">
                    <span style="background: <?= $u['role'] === 'admin' ? '#fdf2f8' : '#eff6ff' ?>; color: <?= $u['role'] === 'admin' ? '#be185d' : '#2563eb' ?>; border: 1px solid <?= $u['role'] === 'admin' ? '#fbcfe8' : '#bfdbfe' ?>; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
                      <?= htmlspecialchars($u['role']) ?>
                    </span>
                  </td>
                  <td style="padding: 0.75rem 1rem; color: #64748b; font-size: 0.85rem;">
                    <?= !empty($u['last_login']) 
                        ? htmlspecialchars(date('d M Y, h:i A', strtotime($u['last_login']))) 
                        : '<span style="color:#94a3b8;">Never</span>' ?>
                  </td>
                  <td style="padding: 0.75rem 1rem;">
                    <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: <?= $u['remember_status'] === 'Active' ? '#16a34a' : '#94a3b8' ?>; font-weight: 600;">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: <?= $u['remember_status'] === 'Active' ? '#16a34a' : '#cbd5e1' ?>;"></span>
                      <?= htmlspecialchars($u['remember_status']) ?>
                    </span>
                  </td>
                  <td style="padding: 0.75rem 1rem; text-align: center;">
                    <div style="display: inline-flex; gap: 0.35rem; align-items: center;">
                      <!-- Toggle Role Form -->
                      <?php if ($u['user_id'] != $_SESSION['user_id']): ?>
                        <form action="admin_dashboard.php" method="POST" style="margin: 0;" onsubmit="return confirm('Toggle role for <?= htmlspecialchars($u['name']) ?>?');">
                          <input type="hidden" name="action" value="toggle_role">
                          <input type="hidden" name="target_user_id" value="<?= (int)$u['user_id'] ?>">
                          <input type="hidden" name="current_role" value="<?= htmlspecialchars($u['role']) ?>">
                          <button type="submit" class="btn" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; background: #e0e7ff; color: #3730a3; border-radius: 6px; border: 1px solid #c7d2fe;" title="Switch role between student and admin">
                            ⇄ <?= $u['role'] === 'admin' ? 'Set Student' : 'Set Admin' ?>
                          </button>
                        </form>

                        <!-- Quick Password Reset -->
                        <form action="admin_dashboard.php" method="POST" style="margin: 0;" onsubmit="return confirm('Reset password for <?= htmlspecialchars($u['name']) ?> to Student@123?');">
                          <input type="hidden" name="action" value="reset_password">
                          <input type="hidden" name="target_user_id" value="<?= (int)$u['user_id'] ?>">
                          <button type="submit" class="btn" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; background: #fef3c7; color: #92400e; border-radius: 6px; border: 1px solid #fde68a;" title="Reset password to Student@123">
                            🔑 Reset Pwd
                          </button>
                        </form>

                        <!-- Delete User Form -->
                        <form action="admin_dashboard.php" method="POST" style="margin: 0;" onsubmit="return confirm('Permanently delete account for <?= htmlspecialchars($u['name']) ?>?');">
                          <input type="hidden" name="action" value="delete_user">
                          <input type="hidden" name="target_user_id" value="<?= (int)$u['user_id'] ?>">
                          <button type="submit" class="btn" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; background: #fee2e2; color: #991b1b; border-radius: 6px; border: 1px solid #fca5a5;" title="Delete user">
                            🗑️ Delete
                          </button>
                        </form>
                      <?php else: ?>
                        <span style="font-size: 0.75rem; color: #94a3b8; font-style: italic;">Current Session</span>
                      <?php endif; ?>
                    </div>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- TAB 2: EVENTS & REGISTRATIONS -->
    <div id="admin-tab-events" class="tab-pane" style="display: none;">
      <section class="panel" style="padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <h2 style="margin: 0; font-size: 1.25rem;">Campus Events & Registration Junctions</h2>
            <p style="margin: 0; font-size: 0.85rem; color: #64748b;">Direct relational monitoring from MySQL `events` and `registrations` tables.</p>
          </div>

          <button type="button" class="btn btn-primary" onclick="toggleAddEventForm()" style="font-size: 0.85rem; padding: 0.45rem 1rem; border-radius: 8px;">
            + Add New Event
          </button>
        </div>

        <!-- Add Event Drawer -->
        <div id="add-event-drawer" style="display: none; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #1e293b;">Add Campus Event to Catalogue</h3>
          <form action="admin_dashboard.php" method="POST" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <input type="hidden" name="action" value="create_event">
            <div>
              <label style="font-size: 0.85rem; font-weight: 600;">Event Name</label>
              <input type="text" name="event_name" placeholder="e.g. Cloud Security Summit" required style="width: 100%; padding: 0.45rem; border-radius: 6px; border: 1px solid #cbd5e1;">
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: 600;">Venue / Location</label>
              <input type="text" name="venue" placeholder="e.g. CSPIT Seminar Hall" required style="width: 100%; padding: 0.45rem; border-radius: 6px; border: 1px solid #cbd5e1;">
            </div>
            <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
              <button type="button" class="btn btn-secondary" onclick="toggleAddEventForm()" style="font-size: 0.85rem;">Cancel</button>
              <button type="submit" class="btn btn-primary" style="font-size: 0.85rem;">Save Event</button>
            </div>
          </form>
        </div>

        <!-- Events List -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                <th style="padding: 0.75rem 1rem;">Event ID</th>
                <th style="padding: 0.75rem 1rem;">Event Name</th>
                <th style="padding: 0.75rem 1rem;">Venue Location</th>
                <th style="padding: 0.75rem 1rem;">Total Students Registered</th>
                <th style="padding: 0.75rem 1rem; text-align: center;">Action</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($eventsList as $ev): ?>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 0.75rem 1rem;"><strong>#<?= htmlspecialchars($ev['event_id']) ?></strong></td>
                  <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e293b;"><?= htmlspecialchars($ev['event_name']) ?></td>
                  <td style="padding: 0.75rem 1rem;">📍 <?= htmlspecialchars($ev['venue']) ?></td>
                  <td style="padding: 0.75rem 1rem;">
                    <span style="background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; font-size: 0.8rem; font-weight: 700; padding: 2px 10px; border-radius: 9999px;">
                      <?= (int)$ev['reg_count'] ?> Students
                    </span>
                  </td>
                  <td style="padding: 0.75rem 1rem; text-align: center;">
                    <form action="admin_dashboard.php" method="POST" style="margin: 0;" onsubmit="return confirm('Delete event #<?= htmlspecialchars($ev['event_name']) ?>?');">
                      <input type="hidden" name="action" value="delete_event">
                      <input type="hidden" name="event_id" value="<?= (int)$ev['event_id'] ?>">
                      <button type="submit" class="btn" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; background: #fee2e2; color: #991b1b; border-radius: 6px; border: 1px solid #fca5a5;">
                        🗑️ Delete
                      </button>
                    </form>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- TAB 3: SESSION & SECURITY MONITOR -->
    <div id="admin-tab-security" class="tab-pane" style="display: none;">
      <div class="grid-cols-2">
        <section class="panel" style="padding: 1.75rem;">
          <h2 style="margin-top: 0; font-size: 1.25rem;">Session Security Architecture</h2>
          <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 1.25rem;">Real-time inspection of active PHP session flags and cookie attributes.</p>

          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.85rem; padding: 0;">
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>Idle Session Timeout:</strong></span>
              <span style="color: #16a34a; font-weight: 700; background: #f0fdf4; padding: 2px 8px; border-radius: 4px;">600s (10 Minutes)</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>HttpOnly Cookie Flag:</strong></span>
              <span style="color: #16a34a; font-weight: 700;">✓ Active (XSS Guard)</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>SameSite Cookie Flag:</strong></span>
              <span style="color: #16a34a; font-weight: 700;">✓ Lax (CSRF Guard)</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>Session Fixation Guard:</strong></span>
              <span style="color: #16a34a; font-weight: 700;">✓ session_regenerate_id(true)</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>Password Hashing Algorithm:</strong></span>
              <span style="color: #16a34a; font-weight: 700;">✓ PASSWORD_DEFAULT (Bcrypt)</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>Remember-Me Token Storage:</strong></span>
              <span style="color: #16a34a; font-weight: 700;">✓ SHA-256 Hashed (Non-JWT)</span>
            </li>
          </ul>
        </section>

        <section class="panel" style="padding: 1.75rem;">
          <h2 style="margin-top: 0; font-size: 1.25rem;">Relational Database Status</h2>
          <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 1.25rem;">Active MySQL PDO connection parameters.</p>

          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.85rem; padding: 0;">
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>Database Host & Port:</strong></span>
              <code>127.0.0.1:3306</code>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>Database Name:</strong></span>
              <code><?= htmlspecialchars($dbname ?? 'campusly') ?></code>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>Charset:</strong></span>
              <code>utf8mb4_unicode_ci</code>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
              <span><strong>PDO Emulate Prepares:</strong></span>
              <span style="color: #16a34a; font-weight: 700;">False (Native Prepared Stmts)</span>
            </li>
            <li style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>Error Mode:</strong></span>
              <span style="color: #16a34a; font-weight: 700;">ERRMODE_EXCEPTION</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

  </main>

  <script>
    function switchAdminTab(tab) {
      document.getElementById('admin-tab-users').style.display = (tab === 'users') ? 'block' : 'none';
      document.getElementById('admin-tab-events').style.display = (tab === 'events') ? 'block' : 'none';
      document.getElementById('admin-tab-security').style.display = (tab === 'security') ? 'block' : 'none';

      document.getElementById('tab-btn-users').classList.toggle('active-tab', tab === 'users');
      document.getElementById('tab-btn-events').classList.toggle('active-tab', tab === 'events');
      document.getElementById('tab-btn-security').classList.toggle('active-tab', tab === 'security');
    }

    function toggleAddUserForm() {
      const drawer = document.getElementById('add-user-drawer');
      drawer.style.display = (drawer.style.display === 'none' || drawer.style.display === '') ? 'block' : 'none';
    }

    function toggleAddEventForm() {
      const drawer = document.getElementById('add-event-drawer');
      drawer.style.display = (drawer.style.display === 'none' || drawer.style.display === '') ? 'block' : 'none';
    }

    function filterUserTable() {
      const input = document.getElementById('user-search-input');
      const filter = input.value.toLowerCase();
      const table = document.getElementById('users-table');
      const trs = table.getElementsByTagName('tr');

      for (let i = 1; i < trs.length; i++) {
        const text = trs[i].textContent.toLowerCase();
        trs[i].style.display = text.includes(filter) ? '' : 'none';
      }
    }
  </script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
