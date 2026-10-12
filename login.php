<?php
/**
 * Practical 10: Secure Login Gateway (login.php)
 * System: Campusly
 */

$pageTitle = "Portal Gateway - Campusly";
$activePage = "login.php";

require_once __DIR__ . '/auth.php';

// If user is already authenticated, redirect to role dashboard
if (is_logged_in()) {
    if ($_SESSION['role'] === 'admin') {
        header('Location: admin_dashboard.php');
    } else {
        header('Location: dashboard.php');
    }
    exit;
}

$errorMessage = '';
$successMessage = '';

// Check query string status messages
$msg = $_GET['msg'] ?? '';
if ($msg === 'timeout') {
    $errorMessage = 'Your session expired after 10 minutes of inactivity. Please sign in again.';
} elseif ($msg === 'unauthorized') {
    $errorMessage = 'Access Denied: You must sign in to view that protected page.';
} elseif ($msg === 'forbidden') {
    $errorMessage = 'Access Forbidden: You do not possess the required permissions for that section.';
} elseif ($msg === 'failed') {
    $errorMessage = 'Invalid email credentials or password. Please verify and try again.';
} elseif ($msg === 'logged_out') {
    $successMessage = 'You have logged out successfully. Session securely terminated.';
}

// Process POST Login or Registration
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'login';

    if ($action === 'login') {
        $email    = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $remember = !empty($_POST['remember_me']);

        if (empty($email) || empty($password)) {
            $errorMessage = 'Please enter both your email address and password.';
        } else {
            // Prepared statement to fetch user by email or name/username
            $stmt = $pdo->prepare("SELECT user_id, name, email, password_hash, role, student_id, last_login 
                                    FROM users 
                                    WHERE email = :email OR name = :name 
                                    LIMIT 1");
            $stmt->execute([':email' => $email, ':name' => $email]);
            $user = $stmt->fetch();

            // Verify password using password_verify()
            if ($user && password_verify($password, $user['password_hash'])) {
                // Log in user (regenerates session ID, tracks last_login, manages remember-me)
                login_user($user, $remember);

                // Role-Based Redirection
                $destination = ($user['role'] === 'admin') ? 'admin_dashboard.php' : 'dashboard.php';
                header("Location: $destination");
                exit;
            } else {
                $errorMessage = 'Invalid email credentials or password. Please verify and try again.';
            }
        }
    } elseif ($action === 'register') {
        $fullname = trim($_POST['fullname'] ?? '');
        $email    = trim($_POST['email'] ?? '');
        $course   = trim($_POST['department'] ?? 'CSE');
        $password = $_POST['password'] ?? '';
        $confirm  = $_POST['confirm_password'] ?? '';

        if (empty($fullname) || empty($email) || empty($password)) {
            $errorMessage = 'All registration fields are required.';
        } elseif ($password !== $confirm) {
            $errorMessage = 'Passwords do not match.';
        } elseif (strlen($password) < 6) {
            $errorMessage = 'Password must be at least 6 characters long.';
        } else {
            try {
                // Check if user already exists
                $chk = $pdo->prepare("SELECT user_id FROM users WHERE email = :email LIMIT 1");
                $chk->execute([':email' => $email]);
                if ($chk->fetch()) {
                    $errorMessage = 'An account with this email already exists. Please log in.';
                } else {
                    // Create student record
                    $stStmt = $pdo->prepare("INSERT INTO students (name, email, course) VALUES (:name, :email, :course)");
                    $stStmt->execute([
                        ':name'   => $fullname,
                        ':email'  => $email,
                        ':course' => $course
                    ]);
                    $newStudentId = $pdo->lastInsertId();

                    // Hash password using password_hash()
                    $hash = password_hash($password, PASSWORD_DEFAULT);

                    // Insert user record with 'student' role
                    $uStmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, student_id) 
                                            VALUES (:name, :email, :hash, 'student', :sid)");
                    $uStmt->execute([
                        ':name'  => $fullname,
                        ':email' => $email,
                        ':hash'  => $hash,
                        ':sid'   => $newStudentId
                    ]);

                    $successMessage = 'Account created successfully! You can now log in below.';
                }
            } catch (PDOException $e) {
                $errorMessage = 'Registration error: ' . htmlspecialchars($e->getMessage());
            }
        }
    }
}

require_once __DIR__ . '/includes/header.php';
?>

  <!-- Breadcrumbs -->
  <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
    <ol class="breadcrumbs">
      <li><a href="index.php">Home</a></li>
      <li aria-current="page">Portal Gateway (Authentication & RBAC)</li>
    </ol>
  </nav>

  <!-- Main Content Area -->
  <main id="main-content">
    <div class="auth-card-container">

      <?php if (!empty($errorMessage)): ?>
        <!-- Professional Error Alert Toast -->
        <div class="auth-notification auth-notification-error" role="alert">
          <div class="auth-notif-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="auth-notif-body">
            <div class="auth-notif-title">Authentication Alert</div>
            <div class="auth-notif-msg"><?= htmlspecialchars($errorMessage) ?></div>
          </div>
          <button type="button" class="auth-notif-close" onclick="this.closest('.auth-notification').remove()" aria-label="Dismiss Alert">&times;</button>
        </div>
      <?php endif; ?>

      <?php if (!empty($successMessage)): ?>
        <!-- Professional Success Alert Toast -->
        <div class="auth-notification auth-notification-success" role="status">
          <div class="auth-notif-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="auth-notif-body">
            <div class="auth-notif-title">Success</div>
            <div class="auth-notif-msg"><?= htmlspecialchars($successMessage) ?></div>
          </div>
          <button type="button" class="auth-notif-close" onclick="this.closest('.auth-notification').remove()" aria-label="Dismiss Alert">&times;</button>
        </div>
      <?php endif; ?>

      <!-- High-End Auth Card -->
      <div class="auth-card">
        
        <!-- Header with Brand Logo Emblem -->
        <div class="auth-card-header">
          <div class="auth-card-badge">
            <img src="images/campusly-logo.png" alt="Campusly Logo" class="auth-card-logo">
          </div>
          <h2 class="auth-card-title">Welcome to <span class="brand-text"><span class="brand-campus">Campus</span><span class="brand-ly">ly</span></span></h2>
          <p class="auth-card-subtitle">Secure Academic Gateway for CHARUSAT Family</p>
        </div>

        <!-- Segmented Pill Tabs -->
        <div class="auth-tab-pills" role="tablist">
          <button type="button" id="tab-login" class="auth-tab-pill active" onclick="switchTab('login')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            Sign In
          </button>
          <button type="button" id="tab-register" class="auth-tab-pill" onclick="switchTab('register')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            Create Account
          </button>
        </div>

        <!-- Log In Pane -->
        <div id="login-pane" class="tab-pane active-pane">
          <form id="login-form" action="login.php" method="POST">
            <input type="hidden" name="action" value="login">

            <div class="form-group">
              <label for="email">University Email Address or Username</label>
              <div class="input-icon-group">
                <span class="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input type="text" id="email" name="email" class="input-with-icon" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" placeholder="e.g. Jay, jayyyy, or admin@campusly.com" autocomplete="username" required>
              </div>
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label for="password" style="margin-bottom: 0;">Account Password</label>
              </div>
              <div class="input-icon-group">
                <span class="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input type="password" id="password" name="password" class="input-with-icon" placeholder="••••••••••••" autocomplete="current-password" required>
                <button type="button" class="btn-toggle-password" onclick="togglePasswordVisibility('password', this)" title="Show / Hide password">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            <div style="display: flex; align-items: center; margin: 1.25rem 0 1.75rem; font-size: 0.9rem;">
              <label style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 500; cursor: pointer; margin-bottom: 0;">
                <input type="checkbox" id="remember_me" name="remember_me" value="1" style="width: 16px; height: 16px; accent-color: var(--primary);">
                <span>Remember me (14-Day Session)</span>
              </label>
            </div>

            <button type="submit" class="btn-auth-submit">
              <span>Sign In to Campusly</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>

            <!-- 1-Click Demo Accounts -->
            <div class="demo-creds-container">
              <div class="demo-creds-header">
                <span class="demo-creds-title">⚡ Quick Autofill Test Accounts:</span>
              </div>
              <div class="demo-pills">
                <button type="button" class="demo-pill-btn" onclick="fillCreds('jay@campusly.com', 'Student@123')">
                  <span>👨‍🎓 Student: Jay</span>
                </button>
                <button type="button" class="demo-pill-btn" onclick="fillCreds('jayyyy@campusly.com', 'Student@123')">
                  <span>👨‍🎓 Student: jayyyy</span>
                </button>
                <button type="button" class="demo-pill-btn" onclick="fillCreds('admin@campusly.com', 'Admin@123')">
                  <span>🛡️ Admin: admin</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Register Pane -->
        <div id="register-pane" class="tab-pane" style="display: none;">
          <form id="register-form" action="login.php" method="POST">
            <input type="hidden" name="action" value="register">

            <div class="form-group">
              <label for="fullname">Full Name</label>
              <div class="input-icon-group">
                <span class="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input type="text" id="fullname" name="fullname" class="input-with-icon" placeholder="e.g. Jay Navadiya" required>
              </div>
            </div>

            <div class="form-group">
              <label for="reg-email">University Email</label>
              <div class="input-icon-group">
                <span class="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input type="email" id="reg-email" name="email" class="input-with-icon" placeholder="name@campusly.edu" required>
              </div>
            </div>

            <div class="form-group">
              <label for="department">Department / Course</label>
              <select id="department" name="department" required>
                <option value="CSE">Computer Science & Engineering (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="CE">Computer Engineering (CE)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="reg-password">Password</label>
              <div class="input-icon-group">
                <span class="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input type="password" id="reg-password" name="password" class="input-with-icon" placeholder="Min. 6 characters" minlength="6" required>
                <button type="button" class="btn-toggle-password" onclick="togglePasswordVisibility('reg-password', this)" title="Show / Hide password">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="confirm_password">Confirm Password</label>
              <div class="input-icon-group">
                <span class="input-icon-prefix">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input type="password" id="confirm_password" name="confirm_password" class="input-with-icon" placeholder="Re-type password" minlength="6" required>
              </div>
            </div>

            <button type="submit" class="btn-auth-submit" style="margin-top: 1rem;">
              <span>Complete Registration</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  </main>

  <script>
    function switchTab(tab) {
      const loginPane = document.getElementById('login-pane');
      const regPane = document.getElementById('register-pane');
      const tabLogin = document.getElementById('tab-login');
      const tabReg = document.getElementById('tab-register');

      if (tab === 'login') {
        loginPane.style.display = 'block';
        regPane.style.display = 'none';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
      } else {
        loginPane.style.display = 'none';
        regPane.style.display = 'block';
        tabLogin.classList.remove('active');
        tabReg.classList.add('active');
      }
    }

    function fillCreds(email, password) {
      switchTab('login');
      const emailInput = document.getElementById('email');
      const passInput = document.getElementById('password');
      if (emailInput && passInput) {
        emailInput.value = email;
        passInput.value = password;
        emailInput.focus();
      }
    }

    function togglePasswordVisibility(fieldId, btn) {
      const input = document.getElementById(fieldId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
      } else {
        input.type = 'password';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      }
    }
  </script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
