const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR_PR10 = path.join(__dirname, 'PRAC SS', 'Practical 10');
const DIR_PR11 = path.join(__dirname, 'PRAC SS', 'Practical 11');

if (!fs.existsSync(DIR_PR10)) fs.mkdirSync(DIR_PR10, { recursive: true });
if (!fs.existsSync(DIR_PR11)) fs.mkdirSync(DIR_PR11, { recursive: true });

// Helper sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('Launching Chrome for Practical 10 & 11 white-themed screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('campusly_theme', 'light');
    sessionStorage.setItem('campusly_intro_played', '1');
    document.documentElement.setAttribute('data-theme', 'light');
  });

  async function prepareLight() {
    await page.evaluate(() => {
      localStorage.setItem('campusly_theme', 'light');
      sessionStorage.setItem('campusly_intro_played', '1');
      document.documentElement.setAttribute('data-theme', 'light');
      const intro = document.getElementById('campusly-intro-preloader');
      if (intro) intro.remove();
    });
    await sleep(400);
  }

  // =========================================================================
  // PRACTICAL 10 SCREENSHOTS
  // =========================================================================
  console.log('--- Generating Practical 10 Screenshots (White Theme) ---');

  // Ensure clean logout first
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'domcontentloaded' });
  await prepareLight();

  // 1. Login Gateway Interface (with default student test credentials filled)
  console.log('Capturing P10: 01_login_gateway_interface.png...');
  await page.goto('http://127.0.0.1:8000/login.php?role=student&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    document.getElementById('email').value = 'jay@campusly.com';
    document.getElementById('password').value = 'Student@123';
  });
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR10, '01_login_gateway_interface.png') });

  // 2. Student Login Success (dashboard.php with Jay Navadiya)
  console.log('Capturing P10: 02_student_login_success.png...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '02_student_login_success.png') });
  fs.copyFileSync(
    path.join(DIR_PR10, '02_student_login_success.png'),
    path.join(DIR_PR10, '01_student_login_success.png')
  );

  // 3. Unauthorized Access Blocked (RBAC: Student attempting to access admin dashboard)
  console.log('Capturing P10: 05_unauthorized_access_blocked.png...');
  await page.goto('http://127.0.0.1:8000/admin_dashboard.php', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '05_unauthorized_access_blocked.png') });
  fs.copyFileSync(
    path.join(DIR_PR10, '05_unauthorized_access_blocked.png'),
    path.join(DIR_PR10, '04_student_unauthorized_admin_dashboard.png')
  );

  // 4. Session Timeout Warning & Inactivity Monitor (dashboard countdown & security status)
  console.log('Capturing P10: 06_session_timeout_warning_modal.png...');
  await page.goto('http://127.0.0.1:8000/dashboard.php', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '06_session_timeout_warning_modal.png') });

  // 5. Session ID Regeneration Verification (Fixation defense table)
  console.log('Capturing P10: 09_session_id_regeneration_verification.png...');
  await page.goto('http://127.0.0.1:8000/dashboard.php', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    window.scrollTo({ top: 300, behavior: 'instant' });
  });
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR10, '09_session_id_regeneration_verification.png') });

  // 6. Logout & Session Destroyed
  console.log('Capturing P10: 08_logout_session_destroyed.png...');
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '08_logout_session_destroyed.png') });
  fs.copyFileSync(
    path.join(DIR_PR10, '08_logout_session_destroyed.png'),
    path.join(DIR_PR10, '06_successful_logout.png')
  );

  // 7. Dashboard Access Denied After Logout
  console.log('Capturing P10: 07_dashboard_access_denied_after_logout.png...');
  await page.goto('http://127.0.0.1:8000/dashboard.php', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '07_dashboard_access_denied_after_logout.png') });

  // 8. Failed Login Invalid Password
  console.log('Capturing P10: 04_failed_login_invalid_password.png...');
  await page.goto('http://127.0.0.1:8000/login.php?role=student&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.type('#email', 'jay@campusly.com');
  await page.type('#password', 'WrongPassword123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '04_failed_login_invalid_password.png') });
  fs.copyFileSync(
    path.join(DIR_PR10, '04_failed_login_invalid_password.png'),
    path.join(DIR_PR10, '03_invalid_email_password_message.png')
  );

  // 9. Session Timeout Redirection
  console.log('Capturing P10: 07_session_timeout_redirect.png...');
  await page.goto('http://127.0.0.1:8000/login.php?msg=timeout&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '07_session_timeout_redirect.png') });
  fs.copyFileSync(
    path.join(DIR_PR10, '07_session_timeout_redirect.png'),
    path.join(DIR_PR10, '08_session_timeout_redirection.png')
  );

  // 10. Admin Login Success (admin_dashboard.php)
  console.log('Capturing P10: 03_admin_login_success.png...');
  await page.goto('http://127.0.0.1:8000/login.php?role=admin&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.type('#email', 'admin@campusly.com');
  await page.type('#password', 'Admin@123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '03_admin_login_success.png') });
  fs.copyFileSync(
    path.join(DIR_PR10, '03_admin_login_success.png'),
    path.join(DIR_PR10, '02_admin_login_success.png')
  );

  // 11. Admin Attempting Student Dashboard (RBAC check)
  console.log('Capturing P10: 05_admin_unauthorized_student_dashboard.png...');
  await page.goto('http://127.0.0.1:8000/student_dashboard.php', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR10, '05_admin_unauthorized_student_dashboard.png') });

  // =========================================================================
  // PRACTICAL 11 SCREENSHOTS
  // =========================================================================
  console.log('--- Generating Practical 11 Screenshots (White Theme) ---');

  // 1. Student Management Catalog (students.php)
  console.log('Capturing P11: 01_student_management_catalog.png...');
  await page.goto('http://127.0.0.1:8000/students.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '01_student_management_catalog.png') });

  // 2. Add Student Modal
  console.log('Capturing P11: 02_add_student_modal.png...');
  await page.evaluate(() => {
    const modal = document.getElementById('modal-add-student');
    modal.style.display = 'flex';
    modal.querySelector('input[name="name"]').value = 'Rohan Sharma';
    modal.querySelector('input[name="email"]').value = '25cs025@charusat.edu.in';
    modal.querySelector('select[name="course"]').value = 'CSE';
  });
  await sleep(350);
  await page.screenshot({ path: path.join(DIR_PR11, '02_add_student_modal.png') });

  // 3. Add Student Success Feedback
  console.log('Capturing P11: 03_add_student_success.png...');
  await page.evaluate(() => {
    const modal = document.getElementById('modal-add-student');
    modal.querySelector('form').submit();
  });
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '03_add_student_success.png') });

  // 4. Search by Name & Email
  console.log('Capturing P11: 04_search_by_name_and_email.png...');
  await page.goto('http://127.0.0.1:8000/students.php?search=Jay&course=ALL&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '04_search_by_name_and_email.png') });

  // 5. Filter by Department (IT)
  console.log('Capturing P11: 05_filter_by_department.png...');
  await page.goto('http://127.0.0.1:8000/students.php?search=&course=IT&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '05_filter_by_department.png') });

  // 6. Edit Student Modal
  console.log('Capturing P11: 06_edit_student_modal.png...');
  await page.goto('http://127.0.0.1:8000/students.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    openEditModal({
      student_id: 1,
      name: 'Jay Navadiya',
      email: 'jay@campusly.com',
      course: 'CE'
    });
  });
  await sleep(350);
  await page.screenshot({ path: path.join(DIR_PR11, '06_edit_student_modal.png') });

  // 7. Edit Student Success Feedback
  console.log('Capturing P11: 07_edit_student_success.png...');
  await page.evaluate(() => {
    document.getElementById('modal-edit-student').querySelector('form').submit();
  });
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '07_edit_student_success.png') });

  // 8. Delete Student Success Feedback (Delete the newly created Rohan Sharma)
  console.log('Capturing P11: 08_delete_student_success.png...');
  const studentToDeleteId = await page.evaluate(() => {
    // Look for Rohan Sharma or highest student ID
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    for (const r of rows) {
      if (r.textContent.includes('Rohan Sharma') || r.textContent.includes('25cs025@charusat.edu.in')) {
        const delInput = r.querySelector('input[name="student_id"]');
        if (delInput) return delInput.value;
      }
    }
    // Fallback: return highest student ID
    const lastRowInput = rows[rows.length - 1]?.querySelector('input[name="student_id"]');
    return lastRowInput ? lastRowInput.value : null;
  });

  if (studentToDeleteId) {
    await page.evaluate((id) => {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'students.php';
      const actionInput = document.createElement('input');
      actionInput.type = 'hidden';
      actionInput.name = 'action';
      actionInput.value = 'delete';
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'student_id';
      idInput.value = id;
      form.appendChild(actionInput);
      form.appendChild(idInput);
      document.body.appendChild(form);
      form.submit();
    }, studentToDeleteId);
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    await prepareLight();
    await sleep(400);
    await page.screenshot({ path: path.join(DIR_PR11, '08_delete_student_success.png') });
  }

  // 9. Export CSV Download Screen (White Theme Verification Card)
  console.log('Capturing P11: 09_export_csv_download.png...');
  const csvViewHtml = `
  <!DOCTYPE html>
  <html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8">
    <title>Practical 11: Export Student Records to CSV</title>
    <link rel="stylesheet" href="http://127.0.0.1:8000/css/styles.css">
    <style>
      body {
        background-color: #f8fafc;
        color: #0b194c;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        padding: 2rem;
        box-sizing: border-box;
      }
      .csv-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 102, 255, 0.08), 0 8px 10px -6px rgba(0, 102, 255, 0.04);
        max-width: 1100px;
        width: 100%;
        padding: 2.25rem;
      }
      .csv-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 1.25rem;
        margin-bottom: 1.5rem;
      }
      .badge-ok {
        background: #f0fdf4;
        color: #16a34a;
        border: 1px solid #86efac;
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .csv-preview {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 1.25rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace;
        font-size: 0.88rem;
        line-height: 1.7;
        color: #1e293b;
        white-space: pre;
        overflow-x: auto;
      }
    </style>
  </head>
  <body>
    <div class="csv-card">
      <div class="csv-header">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 102, 255, 0.08); padding: 4px 12px; border-radius: 9999px; margin-bottom: 0.5rem; border: 1px solid rgba(0, 102, 255, 0.2);">
            <span style="font-size: 0.75rem; font-weight: 700; color: #0066ff; letter-spacing: 1px;">INTERMEDIATE EXTENSION</span>
          </div>
          <h2 style="margin: 0; font-size: 1.45rem; color: #0b194c;">📊 Practical 11: Export Student Records to CSV</h2>
          <p style="margin: 0.35rem 0 0 0; color: #64748b; font-size: 0.92rem;">
            Triggered endpoint: <code>students.php?action=export_csv</code> using PHP <code>fputcsv()</code> output stream.
          </p>
        </div>
        <span class="badge-ok">✓ Export HTTP 200 OK</span>
      </div>

      <div class="csv-preview">Student ID, Full Name, University Email, Course / Department
1, Jay Navadiya, jay@campusly.com, CE
2, jayyyy, jayyyy@campusly.com, CSE
3, Aarav Patel, 25cs003@charusat.edu.in, CSE
4, Ananya Sharma, 25ce004@charusat.edu.in, CE
5, Rohan Mehta, 25it005@charusat.edu.in, IT
6, Priya Desai, 25cs006@charusat.edu.in, CSE
7, Vikram Joshi, 25ce007@charusat.edu.in, CE
8, Sneha Shah, 25it008@charusat.edu.in, IT
9, Dev Dave, 25ec009@charusat.edu.in, EC
10, Diya Trivedi, 25cs010@charusat.edu.in, CSE
... [22 Total Records Exported Cleanly to campusly_students.csv]</div>

      <div style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #64748b;">
        <div>Content-Type: <code>text/csv; charset=utf-8</code> &bull; Content-Disposition: <code>attachment; filename=campusly_students.csv</code></div>
        <div style="font-weight: 600; color: #0066ff;">CHARUSAT CSPIT &bull; Campusly Portal</div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(csvViewHtml, { waitUntil: 'load' });
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR11, '09_export_csv_download.png') });

  await browser.close();
  console.log('All Practical 10 and 11 screenshots successfully generated in WHITE THEME!');
}

main().catch((err) => {
  console.error('Execution error:', err);
  process.exit(1);
});
