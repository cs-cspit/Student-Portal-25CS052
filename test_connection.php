<?php
require_once __DIR__ . '/db.php';

// Prepared Statements for Fetching Students
$stmtStudents = $pdo->prepare("SELECT student_id, name, email, course FROM students ORDER BY student_id ASC");
$stmtStudents->execute();
$students = $stmtStudents->fetchAll();
$studentCount = count($students);

// Prepared Statements for Relational JOIN (registrations + students + events)
$sqlJoin = "SELECT 
                r.reg_id,
                s.name AS student_name,
                e.event_name,
                e.venue
            FROM registrations r
            INNER JOIN students s ON r.student_id = s.student_id
            INNER JOIN events e ON r.event_id = e.event_id
            ORDER BY r.reg_id ASC";
$stmtJoin = $pdo->prepare($sqlJoin);
$stmtJoin->execute();
$registrations = $stmtJoin->fetchAll();
$regCount = count($registrations);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>test_connection.php</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #ffffff;
            color: #000000;
            padding: 30px 40px;
        }
        h3 {
            font-size: 17px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        h4 {
            font-size: 15px;
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 12px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            max-width: 820px;
            margin-bottom: 25px;
            font-size: 14px;
        }
        table, th, td {
            border: 1px solid #777777;
        }
        th {
            font-weight: bold;
            padding: 8px 12px;
            text-align: left;
            background-color: #ffffff;
        }
        td {
            padding: 8px 12px;
            text-align: left;
        }
    </style>
</head>
<body>
    <h3>Testing Data Retrieval using Pure PHP:</h3>

    <h4>Student Records (Count: <?= $studentCount ?>):</h4>
    <table>
        <thead>
            <tr>
                <th style="width: 15%;">Student ID</th>
                <th style="width: 20%;">Name</th>
                <th style="width: 35%;">Email</th>
                <th style="width: 30%;">Course</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($students as $s): ?>
                <tr>
                    <td><?= htmlspecialchars($s['student_id']) ?></td>
                    <td><?= htmlspecialchars($s['name']) ?></td>
                    <td><?= htmlspecialchars($s['email']) ?></td>
                    <td><?= htmlspecialchars($s['course']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <h4>Event Registrations (Count: <?= $regCount ?>):</h4>
    <table>
        <thead>
            <tr>
                <th style="width: 15%;">Reg ID</th>
                <th style="width: 30%;">Student Name</th>
                <th style="width: 30%;">Event Name</th>
                <th style="width: 25%;">Venue</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($registrations as $r): ?>
                <tr>
                    <td><?= htmlspecialchars($r['reg_id']) ?></td>
                    <td><?= htmlspecialchars($r['student_name']) ?></td>
                    <td><?= htmlspecialchars($r['event_name']) ?></td>
                    <td><?= htmlspecialchars($r['venue']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>
