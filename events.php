<?php
/**
 * Campusly Campus Events (events.php)
 */

$pageTitle = "Campus Events - Campusly";
$activePage = "events.php";

require_once __DIR__ . '/auth.php';
require_login(['student', 'admin']);

// Fetch events from MySQL campusly database
$eventsStmt = $pdo->query("SELECT event_id, event_name, venue FROM events ORDER BY event_id ASC");
$dbEvents = $eventsStmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

  <!-- Breadcrumbs -->
  <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
    <ol class="breadcrumbs">
      <li><a href="index.php">Home</a></li>
      <li><a href="<?= ($_SESSION['role'] ?? '') === 'admin' ? 'admin_dashboard.php' : 'dashboard.php' ?>"><?= ($_SESSION['role'] ?? '') === 'admin' ? 'Admin Control Center' : 'Dashboard' ?></a></li>
      <li aria-current="page">Events</li>
    </ol>
  </nav>

  <!-- Main Content Area -->
  <main id="main-content">
    <section class="panel">
      <h1>Campus Events & Technical Workshops</h1>
      <p>Explore official CHARUSAT university hackathons, seminars, and club activities powered by MySQL.</p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
        <?php foreach ($dbEvents as $ev): ?>
          <div class="panel" style="margin-bottom: 0;">
            <span style="background: rgba(56, 189, 248, 0.15); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
              Event #<?= htmlspecialchars($ev['event_id']) ?>
            </span>
            <h3 style="margin-top: 0.5rem; margin-bottom: 0.25rem;"><?= htmlspecialchars($ev['event_name']) ?></h3>
            <p style="font-size: 0.9rem; margin-bottom: 1rem;">📍 Venue: <strong><?= htmlspecialchars($ev['venue']) ?></strong></p>
            <button type="button" class="btn btn-primary" style="width: 100%; font-size: 0.85rem;" onclick="alert('You are registered for <?= htmlspecialchars($ev['event_name']) ?>!')">
              Register for Event
            </button>
          </div>
        <?php endforeach; ?>
      </div>
    </section>
  </main>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
