const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR_PR14 = path.join(__dirname, 'PRAC SS', 'Practical 14');

if (!fs.existsSync(DIR_PR14)) {
  fs.mkdirSync(DIR_PR14, { recursive: true });
}

// Ensure PRACTICAL 14 uppercase folder also exists / syncs
const DIR_PR14_UPPER = path.join(__dirname, 'PRAC SS', 'PRACTICAL 14');
if (!fs.existsSync(DIR_PR14_UPPER)) {
  try {
    fs.symlinkSync('Practical 14', DIR_PR14_UPPER);
  } catch (e) {
    fs.mkdirSync(DIR_PR14_UPPER, { recursive: true });
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Starting Practical 14 High-Quality Light-Themed Screenshot Capture (Perfect Alignments)...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100, deviceScaleFactor: 2 });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('campusly_theme', 'light');
    sessionStorage.setItem('campusly_intro_played', '1');
    document.documentElement.setAttribute('data-theme', 'light');
  });

  async function ensureLightMode() {
    await page.evaluate(() => {
      localStorage.setItem('campusly_theme', 'light');
      sessionStorage.setItem('campusly_intro_played', '1');
      document.documentElement.setAttribute('data-theme', 'light');
      const intro = document.getElementById('campusly-intro-preloader');
      if (intro) intro.remove();
    });
    await sleep(400);
  }

  // -------------------------------------------------------------
  // 1. ADMIN LOGIN & DASHBOARD CAPTURES
  // -------------------------------------------------------------
  console.log('Logging in as Administrator...');
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'domcontentloaded' });
  await ensureLightMode();

  await page.goto('http://127.0.0.1:8000/login.php?role=admin&nointro=1', { waitUntil: 'domcontentloaded' });
  await ensureLightMode();

  await page.evaluate(() => {
    const emailField = document.getElementById('email') || document.querySelector('input[name="email"]');
    const passField = document.getElementById('password') || document.querySelector('input[name="password"]');
    if (emailField) emailField.value = 'admin@campusly.com';
    if (passField) passField.value = 'Admin@123';
  });
  await sleep(300);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await ensureLightMode();
  await sleep(600);

  // 1. Full Admin Dashboard Overview (Top View)
  console.log('📸 1. Capturing 01_admin_dashboard_full_overview.png...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({
    path: path.join(DIR_PR14, '01_admin_dashboard_full_overview.png'),
    clip: { x: 0, y: 0, width: 1600, height: 1050 }
  });

  // 2. Dynamic Stats (User / Student / Event / Registration counts)
  console.log('📸 2. Capturing 02_dynamic_stats_user_student_event_count.png...');
  const statsElem = await page.$('#stats-section');
  if (statsElem) {
    await statsElem.screenshot({
      path: path.join(DIR_PR14, '02_dynamic_stats_user_student_event_count.png')
    });
  }

  // 3. Latest Event Registrations
  console.log('📸 3. Capturing 03_latest_event_registrations.png...');
  await page.evaluate(() => {
    window.scrollTo({ top: 380, behavior: 'instant' });
  });
  await sleep(400);
  await page.screenshot({
    path: path.join(DIR_PR14, '03_latest_event_registrations.png'),
    clip: { x: 60, y: 340, width: 1480, height: 480 }
  });

  // 4. Monthly Registrations Analytics Chart (Advanced Extension)
  console.log('📸 4. Capturing 04_monthly_registrations_analytics_chart.png...');
  const chartCanvas = await page.$('#monthlyRegistrationsChart');
  if (chartCanvas) {
    const chartBox = await chartCanvas.boundingBox();
    if (chartBox) {
      await page.screenshot({
        path: path.join(DIR_PR14, '04_monthly_registrations_analytics_chart.png'),
        clip: {
          x: Math.max(0, chartBox.x - 20),
          y: Math.max(0, chartBox.y - 70),
          width: chartBox.width + 40,
          height: chartBox.height + 90
        }
      });
    }
  }

  // 5. User Management & Active/Inactive Status Toggle (Intermediate Extension)
  console.log('📸 5. Capturing 05_user_status_toggle_intermediate_extension.png...');
  const usersSection = await page.$('#users-section');
  if (usersSection) {
    await usersSection.screenshot({
      path: path.join(DIR_PR14, '05_user_status_toggle_intermediate_extension.png')
    });
  }

  // 6. Audit Logs Table (Proof of recorded admin actions)
  console.log('📸 6. Capturing 06_audit_logs_recorded_admin_actions.png...');
  const auditSection = await page.$('#audit-logs');
  if (auditSection) {
    await auditSection.screenshot({
      path: path.join(DIR_PR14, '06_audit_logs_recorded_admin_actions.png')
    });
  }

  // 7. Dynamic Menu for Admin Role (Top Navbar Highlight)
  console.log('📸 7. Capturing 07_rbac_dynamic_menu_admin_role.png...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({
    path: path.join(DIR_PR14, '07_rbac_dynamic_menu_admin_role.png'),
    clip: { x: 0, y: 0, width: 1600, height: 250 }
  });

  // -------------------------------------------------------------
  // 2. STUDENT LOGIN & DYNAMIC MENU
  // -------------------------------------------------------------
  console.log('Logging in as Student...');
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'domcontentloaded' });
  await ensureLightMode();

  await page.goto('http://127.0.0.1:8000/login.php?role=student&nointro=1', { waitUntil: 'domcontentloaded' });
  await ensureLightMode();

  await page.evaluate(() => {
    const emailField = document.getElementById('email') || document.querySelector('input[name="email"]');
    const passField = document.getElementById('password') || document.querySelector('input[name="password"]');
    if (emailField) emailField.value = 'jay@campusly.com';
    if (passField) passField.value = 'Student@123';
  });
  await sleep(300);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await ensureLightMode();
  await sleep(600);

  // 8. Dynamic Menu for Student Role (Student Portal, Timetable, Material, Events)
  console.log('📸 8. Capturing 08_rbac_dynamic_menu_student_role.png...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await page.screenshot({
    path: path.join(DIR_PR14, '08_rbac_dynamic_menu_student_role.png'),
    clip: { x: 0, y: 0, width: 1600, height: 420 }
  });

  // -------------------------------------------------------------
  // 3. NON-ADMIN ACCESS RESTRICTED (HTTP 403 ERROR PAGE)
  // -------------------------------------------------------------
  console.log('Testing Non-Admin Access Restriction to Admin Dashboard...');
  // Student attempts to access admin dashboard
  await page.goto('http://127.0.0.1:8000/dashboard.php', { waitUntil: 'domcontentloaded' });
  await ensureLightMode();
  await sleep(400);

  console.log('📸 9. Capturing 09_non_admin_access_restricted_403_error.png...');
  await page.screenshot({
    path: path.join(DIR_PR14, '09_non_admin_access_restricted_403_error.png')
  });

  // -------------------------------------------------------------
  // 4. DATABASE AUDIT LOG VERIFICATION PROOF
  // -------------------------------------------------------------
  console.log('Rendering MySQL Database Audit Log Proof...');
  const { execSync } = require('child_process');
  const sqlOutput = execSync(`mysql -u root -e "USE campusly; SELECT log_id, user_email, user_role, action, details, ip_address, created_at FROM audit_logs ORDER BY log_id DESC LIMIT 10;"`).toString();

  const terminalHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>MySQL Audit Logs Proof</title>
    <style>
      body {
        margin: 0;
        padding: 40px;
        background: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #0f172a;
      }
      .proof-card {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.06);
        overflow: hidden;
      }
      .proof-header {
        background: #f1f5f9;
        padding: 16px 24px;
        border-bottom: 1px solid #cbd5e1;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .proof-title {
        font-weight: 700;
        font-size: 1.1rem;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .proof-badge {
        background: #0284c7;
        color: #fff;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
      }
      .terminal-body {
        background: #ffffff;
        color: #0f172a;
        padding: 24px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.88rem;
        line-height: 1.6;
        white-space: pre-wrap;
        border-bottom: 1px solid #e2e8f0;
      }
      .proof-footer {
        padding: 12px 24px;
        background: #f8fafc;
        font-size: 0.85rem;
        color: #64748b;
        display: flex;
        justify-content: space-between;
      }
    </style>
  </head>
  <body>
    <div class="proof-card">
      <div class="proof-header">
        <div class="proof-title">
          <span>🗄️ MySQL Database Verification Proof: \`audit_logs\` Table</span>
        </div>
        <span class="proof-badge">Practical 14 Traceability Proof</span>
      </div>
      <div class="terminal-body">${sqlOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <div class="proof-footer">
        <span>Database: <strong>campusly</strong> | Engine: <strong>InnoDB</strong> | Charset: <strong>utf8mb4</strong></span>
        <span>Generated: <strong>${new Date().toLocaleString()}</strong></span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(terminalHtml, { waitUntil: 'domcontentloaded' });
  await sleep(300);
  console.log('📸 10. Capturing 10_audit_logs_mysql_database_proof.png...');
  await page.screenshot({
    path: path.join(DIR_PR14, '10_audit_logs_mysql_database_proof.png')
  });

  // Also copy files to PRACTICAL 14 (uppercase) if it's a directory
  if (fs.existsSync(DIR_PR14_UPPER) && !fs.lstatSync(DIR_PR14_UPPER).isSymbolicLink()) {
    const files = fs.readdirSync(DIR_PR14);
    for (const f of files) {
      fs.copyFileSync(path.join(DIR_PR14, f), path.join(DIR_PR14_UPPER, f));
    }
  }

  await browser.close();
  console.log('✅ All Practical 14 screenshots successfully generated and saved to PRAC SS -> Practical 14 folder!');
}

main().catch(err => {
  console.error('❌ Error capturing screenshots:', err);
  process.exit(1);
});
