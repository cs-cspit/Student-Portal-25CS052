<?php
require_once __DIR__ . '/db.php';

$stmt = $pdo->prepare("SELECT student_id, name, email, course FROM students ORDER BY student_id ASC");
$stmt->execute();
$students = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Student List</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            color: #000000;
            padding: 30px;
            line-height: 1.8;
        }
        h2 {
            margin-bottom: 25px;
            font-size: 26px;
            font-weight: bold;
        }
        .student-item {
            font-size: 16px;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <h2>Student List</h2>
    <?php foreach ($students as $s): ?>
        <div class="student-item">
            <?= htmlspecialchars($s['student_id']) ?> - <?= htmlspecialchars($s['name']) ?> - <?= htmlspecialchars($s['email']) ?> - <?= htmlspecialchars($s['course']) ?>
        </div>
    <?php endforeach; ?>
</body>
</html>
