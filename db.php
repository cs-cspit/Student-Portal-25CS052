<?php
/**
 * Practical 8: Secure Database Connection (db.php)
 * System: StudentHub
 */

$host    = '127.0.0.1';
$port    = '3306';
$dbname  = 'studenthub';
$user    = 'root';
$pass    = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
        echo "<!DOCTYPE html><html><head><title>Database Connection</title>";
        echo "<style>body{font-family: Arial, sans-serif; padding: 20px; background: #fff; color: #000;}</style></head><body>";
        echo "<h3>Database Connected Successfully</h3>";
        echo "</body></html>";
    }
} catch (PDOException $e) {
    if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
        echo "Database Connection Failed: " . htmlspecialchars($e->getMessage());
    } else {
        die("Database Connection Failed: " . $e->getMessage());
    }
}
