<?php
/**
 * Practical 10: Automated Test Runner & Verification Suite (test_auth.php)
 * System: Campusly
 */

require_once __DIR__ . '/auth.php';

// Action: Simulate 10-minute session timeout for instant testing/demonstration
if (isset($_GET['action']) && $_GET['action'] === 'simulate_timeout') {
    if (isset($_SESSION['user_id'])) {
        // Set last_activity to 605 seconds ago (> 600 seconds = 10 minutes)
        $_SESSION['last_activity'] = time() - 605;
        // Trigger timeout logic
        enforce_session_timeout();
    } else {
        header('Location: login.php?msg=timeout');
        exit;
    }
}

// Perform automated test checks
$tests = [];

// Test 1: Database and users table check
try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    $tests[] = [
        'name' => 'Database & Seeded Users Verification',
        'status' => $userCount >= 3 ? 'PASS' : 'WARN',
        'details' => "Found $userCount user records in $dbname.users."
    ];
} catch (Exception $e) {
    $tests[] = [
        'name' => 'Database & Seeded Users Verification',
        'status' => 'FAIL',
        'details' => $e->getMessage()
    ];
}

// Test 2: password_verify() verification
$adminUser = $pdo->query("SELECT * FROM users WHERE email IN ('admin@campusly.com', 'admin@studenthub.com') ORDER BY user_id ASC LIMIT 1")->fetch();
$studentUser = $pdo->query("SELECT * FROM users WHERE email = 'jaynavadiya@gmail.com'")->fetch();

$adminPassCheck = $adminUser && password_verify('Admin@123', $adminUser['password_hash']);
$studentPassCheck = $studentUser && password_verify('Student@123', $studentUser['password_hash']);
$invalidPassCheck = !password_verify('WrongPassword999', $studentUser['password_hash'] ?? '');

$tests[] = [
    'name' => 'password_verify() Execution',
    'status' => ($adminPassCheck && $studentPassCheck && $invalidPassCheck) ? 'PASS' : 'FAIL',
    'details' => 'Admin@123 verified (' . ($adminPassCheck ? 'Yes' : 'No') . '), Student@123 verified (' . ($studentPassCheck ? 'Yes' : 'No') . '), Wrong password rejected (' . ($invalidPassCheck ? 'Yes' : 'No') . ').'
];

// Test 3: Session Security Settings
$useOnlyCookies = ini_get('session.use_only_cookies');
$useStrictMode = ini_get('session.use_strict_mode');
$cookieParams = session_get_cookie_params();

$tests[] = [
    'name' => 'Hardened Session Cookie Configuration',
    'status' => ($useOnlyCookies == '1' && $cookieParams['httponly']) ? 'PASS' : 'WARN',
    'details' => 'use_only_cookies: ' . ($useOnlyCookies ? 'Enabled' : 'Disabled') . 
                 ', HttpOnly: ' . ($cookieParams['httponly'] ? 'True' : 'False') . 
                 ', SameSite: ' . ($cookieParams['samesite'] ?? 'Lax')
];

// Test 4: 10-Minute Timeout Configuration
$tests[] = [
    'name' => 'Session Timeout Constant (10 Minutes)',
    'status' => (SESSION_TIMEOUT_SECONDS === 600) ? 'PASS' : 'FAIL',
    'details' => 'SESSION_TIMEOUT_SECONDS = ' . SESSION_TIMEOUT_SECONDS . ' seconds (' . (SESSION_TIMEOUT_SECONDS / 60) . ' minutes).'
];

// Test 5: Role-Based Access Control (RBAC) definitions
$tests[] = [
    'name' => 'Role-Based Access Control (RBAC) Configuration',
    'status' => ($adminUser['role'] === 'admin' && $studentUser['role'] === 'student') ? 'PASS' : 'FAIL',
    'details' => 'Admin Role: ' . htmlspecialchars($adminUser['role'] ?? '') . ' | Student Role: ' . htmlspecialchars($studentUser['role'] ?? '')
];

// Test 6: Intermediate Extension (last_login timestamp)
$tests[] = [
    'name' => 'Intermediate Extension: last_login Column in Users Table',
    'status' => array_key_exists('last_login', $adminUser ?? []) ? 'PASS' : 'FAIL',
    'details' => 'last_login column verified. Current admin timestamp: ' . ($adminUser['last_login'] ?? 'NULL')
];

// Test 7: Advanced Extension (Remember-Me SHA-256 Token)
$tests[] = [
    'name' => 'Advanced Extension: Remember-Me Token Hash in Database',
    'status' => (array_key_exists('remember_token_hash', $studentUser ?? []) && array_key_exists('remember_token_expires', $studentUser ?? [])) ? 'PASS' : 'FAIL',
    'details' => 'remember_token_hash (SHA-256) and remember_token_expires columns exist in users schema.'
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Practical 10 Security & Verification Suite - Campusly</title>
  <script>
    (function() {
      const savedTheme = localStorage.getItem('campusly_theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    })();
  </script>
  <link rel="stylesheet" href="css/styles.css">
  <style>
    .test-card {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: 8px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge-pass { background: #dcfce7; color: #166534; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
    .badge-fail { background: #fee2e2; color: #991b1b; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
    .badge-warn { background: #fef3c7; color: #92400e; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; }
    .quick-link-box {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .quick-link-card {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .quick-link-card h4 { margin-top: 0; margin-bottom: 0.5rem; color: var(--text-main); }
    .quick-link-card a { font-weight: 600; text-decoration: none; color: var(--primary); }
  </style>
</head>
<body>
  <div class="top-corner-controls">
    <button type="button" id="theme-toggle-btn" class="theme-toggle-round-btn" onclick="toggleTheme()" aria-label="Switch Dark (#092328) / Light Theme" title="Toggle Dark/Light Theme">
      <span class="icon-sun" aria-hidden="true">☀️</span>
      <span class="icon-moon" aria-hidden="true">🌙</span>
    </button>
  </div>
  <script>
    function toggleTheme() {
      const htmlEl = document.documentElement;
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('campusly_theme', newTheme);
      } catch(e) {}
    }
  </script>
  <header>
    <div class="header-container">
      <a href="index.php" class="logo-link">
        <img src="images/campusly-logo.png" alt="Campusly Logo" class="brand-logo-img">
        <span class="brand-text"><span class="brand-campus">Campus</span><span class="brand-ly">ly</span> <small style="font-size:0.9rem; color:#64748b; margin-left:6px;">Verification</small></span>
      </a>
      <nav class="primary-nav">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="login.php">Login</a></li>
          <li><a href="dashboard.php">Student Dashboard</a></li>
          <li><a href="admin_dashboard.php">Admin Dashboard</a></li>
          <li><a href="test_auth.php" aria-current="page">Verification Suite</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main-content" style="max-width: 900px; margin: 2rem auto; padding: 0 1rem;">
    <h1>Practical 10 Verification Suite</h1>
    <p>Comprehensive security validation of Session Management, RBAC, 10-Minute Timeout, and Remember-Me Token features.</p>

    <div class="panel" style="margin-bottom: 2rem;">
      <h3>⚡ Quick Scenario Testing Links</h3>
      <div class="quick-link-box">
        <div class="quick-link-card">
          <h4>Scenario 1: Login Success</h4>
          <p style="font-size: 0.85rem; color: #64748b;">Sign in with student or admin account</p>
          <a href="login.php" class="btn btn-primary" style="display:inline-block; margin-top:0.5rem;">Open Login</a>
        </div>
        <div class="quick-link-card">
          <h4>Scenario 2: Unauthorized Access</h4>
          <p style="font-size: 0.85rem; color: #64748b;">Attempt direct access without session</p>
          <a href="dashboard.php" class="btn btn-secondary" style="display:inline-block; margin-top:0.5rem;">Try Protected Dashboard</a>
        </div>
        <div class="quick-link-card">
          <h4>Scenario 3: 10-Min Timeout</h4>
          <p style="font-size: 0.85rem; color: #64748b;">Instantly trigger 600s inactivity expiry</p>
          <a href="test_auth.php?action=simulate_timeout" class="btn" style="background:#dc2626; color:#fff; display:inline-block; margin-top:0.5rem;">Simulate Timeout</a>
        </div>
        <div class="quick-link-card">
          <h4>Scenario 4: Secure Logout</h4>
          <p style="font-size: 0.85rem; color: #64748b;">Destroy session and clear tokens</p>
          <a href="logout.php" class="btn btn-secondary" style="display:inline-block; margin-top:0.5rem;">Perform Logout</a>
        </div>
      </div>
    </div>

    <h2>Automated Check Results</h2>
    <?php foreach ($tests as $t): ?>
      <div class="test-card">
        <div>
          <strong style="font-size: 1.05rem;"><?= htmlspecialchars($t['name']) ?></strong>
          <div style="font-size: 0.88rem; color: #64748b; margin-top: 0.25rem;">
            <?= htmlspecialchars($t['details']) ?>
          </div>
        </div>
        <span class="badge-<?= strtolower($t['status']) ?>"><?= htmlspecialchars($t['status']) ?></span>
      </div>
    <?php endforeach; ?>

  </main>
</body>
</html>
