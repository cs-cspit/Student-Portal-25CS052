<?php
/**
 * Practical 10: Secure Authentication & Session Management Module
 * System: Campusly (formerly StudentHub)
 * 
 * Features:
 * 1. Hardened Session Configuration (HttpOnly, SameSite, Secure, Strict Mode)
 * 2. 10-Minute Idle Session Timeout (600 seconds)
 * 3. Session Fixation Defense via session_regenerate_id(true)
 * 4. Password Verification via password_verify()
 * 5. Role-Based Access Control (RBAC) for Admin & Student
 * 6. Secure Remember-Me Token using random bytes + SHA-256 database hash
 * 7. Last-Login Timestamp Tracking
 */

require_once __DIR__ . '/db.php';

// Session Timeout duration: 10 minutes = 600 seconds
define('SESSION_TIMEOUT_SECONDS', 600);

/**
 * Initialize secure session with hardened cookie flags
 */
function init_secure_session() {
    if (session_status() === PHP_SESSION_NONE) {
        // Enforce cookie-only session handling and strict session ID mode
        ini_set('session.use_only_cookies', '1');
        ini_set('session.use_strict_mode', '1');

        $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

        session_set_cookie_params([
            'lifetime' => 0,          // Browser session cookie
            'path'     => '/',
            'domain'   => '',
            'secure'   => $isHttps,   // Secure flag if HTTPS
            'httponly' => true,       // Prevent JavaScript XSS access to session cookie
            'samesite' => 'Lax'       // CSRF mitigation
        ]);

        session_start();
    }
}

init_secure_session();

/**
 * Handle 10-minute session timeout
 */
function enforce_session_timeout() {
    if (isset($_SESSION['user_id'])) {
        if (isset($_SESSION['last_activity'])) {
            $inactiveTime = time() - $_SESSION['last_activity'];
            if ($inactiveTime > SESSION_TIMEOUT_SECONDS) {
                // Session has exceeded 10 minutes of inactivity
                logout_user('timeout');
                header('Location: login.php?msg=timeout');
                exit;
            }
        }
        // Refresh last activity timestamp for current user interaction
        $_SESSION['last_activity'] = time();
    }
}

/**
 * Check and restore session via Remember-Me token if not currently logged in
 */
function check_remember_token() {
    global $pdo;

    if (empty($_SESSION['user_id']) && !empty($_COOKIE['remember_token'])) {
        $rawToken = $_COOKIE['remember_token'];
        $tokenHash = hash('sha256', $rawToken);

        $stmt = $pdo->prepare("SELECT user_id, name, email, role, student_id, last_login 
                                FROM users 
                                WHERE remember_token_hash = :hash 
                                  AND remember_token_expires > NOW() 
                                LIMIT 1");
        $stmt->execute([':hash' => $tokenHash]);
        $user = $stmt->fetch();

        if ($user) {
            // Valid token found: regenerate session ID to prevent fixation
            session_regenerate_id(true);

            $_SESSION['user_id']       = $user['user_id'];
            $_SESSION['user_name']     = $user['name'];
            $_SESSION['user_email']    = $user['email'];
            $_SESSION['role']          = $user['role'];
            $_SESSION['student_id']    = $user['student_id'];
            $_SESSION['last_activity'] = time();

            // Update last login timestamp
            $upd = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE user_id = :uid");
            $upd->execute([':uid' => $user['user_id']]);
        } else {
            // Invalid or expired token: clear cookie
            setcookie('remember_token', '', [
                'expires'  => time() - 3600,
                'path'     => '/',
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        }
    }
}

// Automatically check remember-me and enforce timeout on each request
check_remember_token();
enforce_session_timeout();

/**
 * Check if the current client is authenticated
 */
function is_logged_in() {
    return !empty($_SESSION['user_id']);
}

/**
 * Require active authentication and optional role authorization (RBAC)
 */
function require_login($allowed_roles = []) {
    if (!is_logged_in()) {
        $_SESSION['intended_destination'] = $_SERVER['REQUEST_URI'] ?? 'dashboard.php';
        header('Location: login.php?msg=unauthorized');
        exit;
    }

    if (!empty($allowed_roles)) {
        $userRole = $_SESSION['role'] ?? '';
        if (!in_array($userRole, (array)$allowed_roles)) {
            // Role not authorized
            if ($userRole === 'student') {
                header('Location: dashboard.php?msg=forbidden');
            } else {
                header('Location: admin_dashboard.php?msg=forbidden');
            }
            exit;
        }
    }
}

/**
 * Authenticate and log in user
 */
function login_user($user, $remember = false) {
    global $pdo;

    // Defend against session fixation by regenerating session ID
    session_regenerate_id(true);

    $_SESSION['user_id']       = $user['user_id'];
    $_SESSION['user_name']     = $user['name'];
    $_SESSION['user_email']    = $user['email'];
    $_SESSION['role']          = $user['role'];
    $_SESSION['student_id']    = $user['student_id'];
    $_SESSION['last_activity'] = time();

    // Intermediate Extension: Record last login timestamp
    $upd = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE user_id = :uid");
    $upd->execute([':uid' => $user['user_id']]);

    // Advanced Extension: Secure Remember-Me Token via random_bytes & SHA-256 hash
    if ($remember) {
        $rawToken  = bin2hex(random_bytes(32)); // 64 hex characters cryptographically strong token
        $tokenHash = hash('sha256', $rawToken); // Store only SHA-256 hash in DB
        $expiresAt = date('Y-m-d H:i:s', time() + (14 * 86400)); // 14 days validity

        $tokenStmt = $pdo->prepare("UPDATE users 
                                    SET remember_token_hash = :hash, 
                                        remember_token_expires = :expires 
                                    WHERE user_id = :uid");
        $tokenStmt->execute([
            ':hash'    => $tokenHash,
            ':expires' => $expiresAt,
            ':uid'     => $user['user_id']
        ]);

        $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
        setcookie('remember_token', $rawToken, [
            'expires'  => time() + (14 * 86400),
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
            'secure'   => $isHttps
        ]);
    }
}

/**
 * Completely log out user and destroy session & cookies
 */
function logout_user($reason = 'manual') {
    global $pdo;

    // Clear remember-me token from database if user is known
    if (!empty($_SESSION['user_id']) && isset($pdo)) {
        try {
            $stmt = $pdo->prepare("UPDATE users SET remember_token_hash = NULL, remember_token_expires = NULL WHERE user_id = :uid");
            $stmt->execute([':uid' => $_SESSION['user_id']]);
        } catch (Exception $e) {
            // Ignore DB errors during logout
        }
    }

    // Clear remember-me cookie
    if (isset($_COOKIE['remember_token'])) {
        setcookie('remember_token', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        unset($_COOKIE['remember_token']);
    }

    // Clear all session variables
    $_SESSION = [];

    // Erase session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }

    // Destroy session storage
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}

/**
 * Return seconds remaining until current session timeout
 */
function get_session_time_remaining() {
    if (!isset($_SESSION['last_activity'])) {
        return SESSION_TIMEOUT_SECONDS;
    }
    $elapsed = time() - $_SESSION['last_activity'];
    return max(0, SESSION_TIMEOUT_SECONDS - $elapsed);
}
