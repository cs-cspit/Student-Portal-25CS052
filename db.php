<?php
/**
 * Practical 8: Secure Database Connection (db.php)
 * System: Campusly (formerly StudentHub)
 */

$host    = '127.0.0.1';
$port    = '3306';
$dbname  = 'campusly';
$user    = 'root';
$pass    = '';
$charset = 'utf8mb4';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Graceful fallback to studenthub if campusly database not yet created
    try {
        $fallbackDsn = "mysql:host=$host;port=$port;dbname=studenthub;charset=$charset";
        $pdo = new PDO($fallbackDsn, $user, $pass, $options);
        $dbname = 'studenthub';
    } catch (PDOException $e2) {
        if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
            echo "Database Connection Failed: " . htmlspecialchars($e2->getMessage());
        } else {
            die("Database Connection Failed: " . $e2->getMessage());
        }
    }
}

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    echo "<!DOCTYPE html><html><head><title>Database Connection - Campusly</title>";
    echo "<style>body{font-family: Arial, sans-serif; padding: 20px; background: #fff; color: #000;}</style></head><body>";
    echo "<h3>Database Connected Successfully ($dbname)</h3>";
    echo "</body></html>";
}
