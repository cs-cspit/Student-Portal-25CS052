const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(__dirname, 'PRAC SS', 'Practical 10');

// Ensure directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Clean old files in folder
const oldFiles = fs.readdirSync(OUT_DIR);
for (const file of oldFiles) {
  if (file.endsWith('.png')) {
    fs.unlinkSync(path.join(OUT_DIR, file));
    console.log(`Removed old screenshot: ${file}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching Chrome for Practical 10 white-themed screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });

  // Helper to ensure clean white theme and dismiss preloader
  async function preparePage() {
    await page.evaluate(() => {
      sessionStorage.setItem('campusly_intro_played', '1');
      localStorage.setItem('campusly_theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
      const intro = document.getElementById('campusly-intro-preloader');
      if (intro) intro.remove();
    });
    await sleep(300);
  }

  // 1. Requirement 3: Invalid email/password message
  console.log('Capturing 03_invalid_email_password_message.png...');
  await page.goto('http://127.0.0.1:8000/login.php?role=student', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.type('#email', 'jay@campusly.com');
  await page.type('#password', 'WrongPassword999');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '03_invalid_email_password_message.png'), fullPage: false });

  // 2. Requirement 1: Successful student login
  console.log('Capturing 01_student_login_success.png...');
  await page.goto('http://127.0.0.1:8000/login.php?role=student', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.type('#email', 'jay@campusly.com');
  await page.type('#password', 'Student@123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '01_student_login_success.png'), fullPage: false });

  // 3. Requirement 9: Session ID regeneration after successful login
  console.log('Capturing 09_session_id_regeneration_verification.png...');
  await page.evaluate(() => {
    window.scrollTo({ top: 320, behavior: 'instant' });
  });
  await sleep(300);
  await page.screenshot({ path: path.join(OUT_DIR, '09_session_id_regeneration_verification.png'), fullPage: false });

  // 4. Requirement 4: Student attempting to access the admin dashboard (Unauthorized Access)
  console.log('Capturing 04_student_unauthorized_admin_dashboard.png...');
  await page.goto('http://127.0.0.1:8000/admin_dashboard.php', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '04_student_unauthorized_admin_dashboard.png'), fullPage: false });

  // 5. Requirement 6: Successful logout
  console.log('Capturing 06_successful_logout.png...');
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '06_successful_logout.png'), fullPage: false });

  // 6. Requirement 7: Dashboard access denied after logout
  console.log('Capturing 07_dashboard_access_denied_after_logout.png...');
  await page.goto('http://127.0.0.1:8000/dashboard.php', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '07_dashboard_access_denied_after_logout.png'), fullPage: false });

  // 7. Requirement 2: Successful admin login
  console.log('Capturing 02_admin_login_success.png...');
  await page.goto('http://127.0.0.1:8000/login.php?role=admin', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.type('#email', 'admin@campusly.com');
  await page.type('#password', 'Admin@123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '02_admin_login_success.png'), fullPage: false });

  // 8. Requirement 5: Admin attempting to access the student dashboard (Unauthorized Access)
  console.log('Capturing 05_admin_unauthorized_student_dashboard.png...');
  await page.goto('http://127.0.0.1:8000/student_dashboard.php', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '05_admin_unauthorized_student_dashboard.png'), fullPage: false });

  // 9. Requirement 8: Session timeout and redirection to login
  console.log('Capturing 08_session_timeout_redirection.png...');
  await page.goto('http://127.0.0.1:8000/timeout.php?action=simulate_timeout', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '08_session_timeout_redirection.png'), fullPage: false });

  await browser.close();
  console.log('All 9 white-themed Practical 10 screenshots successfully generated in PRAC SS/Practical 10!');
}

run().catch(err => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});
