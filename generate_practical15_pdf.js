const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR_PR15 = path.join(__dirname, 'PRAC SS', 'Practical 15');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureLightMode(page) {
  await page.evaluate(() => {
    localStorage.setItem('campusly_theme', 'light');
    sessionStorage.setItem('campusly_intro_played', '1');
    document.documentElement.setAttribute('data-theme', 'light');
    const intro = document.getElementById('campusly-intro-preloader');
    if (intro) intro.remove();
  });
  await sleep(350);
}

async function captureExtraScreenshots(page) {
  console.log('📸 Capturing additional requirement-specific screenshots...');

  // 1. Registration: Form Filled with data
  console.log('Capturing reg_01_form_filled.png...');
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'domcontentloaded' });
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await ensureLightMode(page);
  await page.evaluate(() => {
    document.getElementById('fullname').value = 'Dev Patel';
    document.getElementById('email').value = 'dev.patel@charusat.edu.in';
    document.getElementById('department').value = 'CSE';
    document.getElementById('password').value = 'Student@123';
    document.getElementById('confirm_password').value = 'Student@123';
  });
  await sleep(300);
  await page.screenshot({
    path: path.join(DIR_PR15, 'reg_01_form_filled.png'),
    clip: { x: 0, y: 0, width: 1600, height: 1050 }
  });

  // 2. Registration: Successful Registration Alert
  console.log('Capturing reg_02_registration_success.png...');
  const testEmail = `dev.patel.${Date.now()}@charusat.edu.in`;
  await page.evaluate((email) => {
    document.getElementById('fullname').value = 'Dev Patel';
    document.getElementById('email').value = email;
    document.getElementById('department').value = 'CSE';
    document.getElementById('password').value = 'Student@123';
    document.getElementById('confirm_password').value = 'Student@123';
  }, testEmail);
  await sleep(200);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await ensureLightMode(page);
  await sleep(400);
  await page.screenshot({
    path: path.join(DIR_PR15, 'reg_02_registration_success.png'),
    clip: { x: 0, y: 0, width: 1600, height: 1050 }
  });

  // 3. Registration: Validation Error (Password Mismatch)
  console.log('Capturing reg_03_validation_error.png...');
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await ensureLightMode(page);
  await page.evaluate(() => {
    document.getElementById('fullname').value = 'Dev Patel';
    document.getElementById('email').value = 'dev.patel99@charusat.edu.in';
    document.getElementById('department').value = 'CSE';
    document.getElementById('password').value = 'Student@123';
    document.getElementById('confirm_password').value = 'Mismatch@999';
  });
  await sleep(200);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await ensureLightMode(page);
  await sleep(400);
  await page.screenshot({
    path: path.join(DIR_PR15, 'reg_03_validation_error.png'),
    clip: { x: 0, y: 0, width: 1600, height: 1050 }
  });

  // 4. Session Timeout: Redirect notification on login.php?msg=timeout
  console.log('Capturing timeout_02_expired_redirect.png...');
  await page.goto('http://127.0.0.1:8000/login.php?msg=timeout&nointro=1', { waitUntil: 'domcontentloaded' });
  await ensureLightMode(page);
  await sleep(400);
  await page.screenshot({
    path: path.join(DIR_PR15, 'timeout_02_expired_redirect.png'),
    clip: { x: 0, y: 0, width: 1600, height: 1050 }
  });

  // 5. Timetable Schedule (Logged in as Student)
  console.log('Capturing timetable_schedule_light.png...');
  await page.goto('http://127.0.0.1:8000/login.php?role=student&nointro=1', { waitUntil: 'domcontentloaded' });
  await ensureLightMode(page);
  await page.evaluate(() => {
    const emailField = document.getElementById('email') || document.querySelector('input[name="email"]');
    const passField = document.getElementById('password') || document.querySelector('input[name="password"]');
    if (emailField) emailField.value = 'jay@campusly.com';
    if (passField) passField.value = 'Student@123';
  });
  await sleep(200);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await ensureLightMode(page);

  await page.goto('http://127.0.0.1:8000/timetable.php', { waitUntil: 'domcontentloaded' });
  await ensureLightMode(page);
  await sleep(400);
  await page.screenshot({
    path: path.join(DIR_PR15, 'timetable_schedule_light.png'),
    clip: { x: 0, y: 0, width: 1600, height: 1050 }
  });

  // 6. Materials Repository (Logged in as Student)
  console.log('Capturing materials_repository_light.png...');
  await page.goto('http://127.0.0.1:8000/material.php', { waitUntil: 'domcontentloaded' });
  await ensureLightMode(page);
  await sleep(400);
  await page.screenshot({
    path: path.join(DIR_PR15, 'materials_repository_light.png'),
    clip: { x: 0, y: 0, width: 1600, height: 1050 }
  });

  console.log('✅ Additional screenshots captured successfully!');
}

function imageToBase64(imgPath) {
  if (fs.existsSync(imgPath)) {
    const data = fs.readFileSync(imgPath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

async function buildPdfReport(browser) {
  console.log('📄 Building Comprehensive Practical 15 PDF Report...');

  // Map of screenshots to embed
  const images = {
    landing: imageToBase64(path.join(DIR_PR15, '01_integrated_home_landing_page.png')),
    loginGateway: imageToBase64(path.join(DIR_PR15, '02_user_login_auth_gateway.png')),
    regForm: imageToBase64(path.join(DIR_PR15, '03_user_registration_validation.png')),
    regFilled: imageToBase64(path.join(DIR_PR15, 'reg_01_form_filled.png')),
    regSuccess: imageToBase64(path.join(DIR_PR15, 'reg_02_registration_success.png')),
    regError: imageToBase64(path.join(DIR_PR15, 'reg_03_validation_error.png')),
    adminDashboard: imageToBase64(path.join(DIR_PR15, '04_admin_dashboard_full_overview.png')),
    auditLogs: imageToBase64(path.join(DIR_PR15, '05_admin_audit_logs_security_trail.png')),
    studentDashboard: imageToBase64(path.join(DIR_PR15, '06_student_dashboard_overview.png')),
    studentCrud: imageToBase64(path.join(DIR_PR15, '07_student_crud_management_interface.png')),
    studentAddModal: imageToBase64(path.join(DIR_PR15, '08_ajax_student_add_modal.png')),
    studentSearchFilter: imageToBase64(path.join(DIR_PR15, '09_ajax_search_and_filter_live.png')),
    eventsCatalog: imageToBase64(path.join(DIR_PR15, '10_events_catalog_and_registrations.png')),
    timeoutModal: imageToBase64(path.join(DIR_PR15, '11_security_10min_session_timeout_modal.png')),
    timeoutRedirect: imageToBase64(path.join(DIR_PR15, 'timeout_02_expired_redirect.png')),
    rbac403: imageToBase64(path.join(DIR_PR15, '12_security_rbac_403_access_denied.png')),
    mobileView: imageToBase64(path.join(DIR_PR15, '13_responsive_mobile_viewport.png')),
    vhostConfig: imageToBase64(path.join(DIR_PR15, '14_apache_virtual_host_configuration.png')),
    dbDump: imageToBase64(path.join(DIR_PR15, '15_mysql_studenthub_database_schema_dump.png')),
    gitHistory: imageToBase64(path.join(DIR_PR15, '16_git_clean_repository_and_commit_history.png')),
    timetable: imageToBase64(path.join(DIR_PR15, 'timetable_schedule_light.png')),
    materials: imageToBase64(path.join(DIR_PR15, 'materials_repository_light.png')),
  };

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>25CS052_Campusly_Prac15</title>
    <style>
      @page {
        size: A4;
        margin: 14mm 14mm 16mm 14mm;
        @bottom-right {
          content: counter(page);
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
        background: #ffffff;
        font-size: 11pt;
        line-height: 1.5;
      }

      .page-break {
        page-break-before: always;
        break-before: page;
      }

      /* Header & Cover Banner */
      .inst-header {
        text-align: center;
        border-bottom: 2px solid #0284c7;
        padding-bottom: 12px;
        margin-bottom: 18px;
      }

      .inst-title {
        font-size: 13pt;
        font-weight: 800;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 3px;
      }

      .inst-sub {
        font-size: 10.5pt;
        font-weight: 700;
        color: #0284c7;
        margin-bottom: 3px;
      }

      .report-title {
        font-size: 15pt;
        font-weight: 800;
        color: #0f172a;
        margin-top: 6px;
        margin-bottom: 2px;
      }

      .report-subtitle {
        font-size: 10.5pt;
        font-style: italic;
        color: #475569;
      }

      /* Metadata Grid */
      .meta-box {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 10px 14px;
        margin-bottom: 20px;
        font-size: 9pt;
      }

      .meta-item strong {
        color: #0f172a;
      }

      /* Section Styling */
      .section-block {
        margin-bottom: 24px;
      }

      .section-heading {
        font-size: 12pt;
        font-weight: 800;
        color: #0f172a;
        background: #f1f5f9;
        border-left: 5px solid #0284c7;
        padding: 6px 12px;
        margin-top: 0;
        margin-bottom: 8px;
        border-radius: 0 6px 6px 0;
      }

      .item-title {
        font-size: 10.5pt;
        font-weight: 700;
        color: #1e293b;
        margin-top: 10px;
        margin-bottom: 4px;
      }

      .item-desc {
        font-size: 9pt;
        color: #475569;
        margin-bottom: 6px;
      }

      .screenshot-container {
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        margin-bottom: 14px;
        background: #ffffff;
      }

      .screenshot-container img {
        width: 100%;
        height: auto;
        display: block;
      }

      /* Summary Table */
      table.summary-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 8.5pt;
        margin-bottom: 16px;
      }

      table.summary-table th {
        background: #0f172a;
        color: #ffffff;
        font-weight: 700;
        text-align: left;
        padding: 7px 10px;
        border: 1px solid #cbd5e1;
      }

      table.summary-table td {
        padding: 6px 10px;
        border: 1px solid #cbd5e1;
        color: #1e293b;
      }

      table.summary-table tr:nth-child(even) {
        background: #f8fafc;
      }

      .badge-success {
        display: inline-block;
        background: #dcfce7;
        color: #15803d;
        padding: 2px 7px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 7.5pt;
      }
    </style>
  </head>
  <body>

    <!-- COVER / HEADER -->
    <div class="inst-header">
      <div class="inst-title">Chandubhai S. Patel Institute of Technology (CSPIT)</div>
      <div class="inst-sub">Department of Computer Science & Engineering &bull; CHARUSAT</div>
      <div class="report-title">StudentHub (Campusly) &mdash; Final Project Features & Requirements Satisfaction Report</div>
      <div class="report-subtitle">Practical 15: Full Integration, Testing, Documentation, Local Deployment & Submission Proof</div>
    </div>

    <!-- METADATA BOX -->
    <div class="meta-box">
      <div class="meta-item"><strong>Student Name:</strong> Jay Navadiya</div>
      <div class="meta-item"><strong>Student ID / Roll No:</strong> 25CS052</div>
      <div class="meta-item"><strong>Course:</strong> ITUE203 - Web Development Frameworks</div>
      <div class="meta-item"><strong>Semester / Branch:</strong> B.Tech CSE (Div-I)</div>
      <div class="meta-item"><strong>GitHub Repo:</strong> github.com/cs-cspit/Student-Portal-25CS052</div>
      <div class="meta-item"><strong>Database Engine:</strong> MySQL 8.x (3NF Relational Database &#96;studenthub&#96;)</div>
    </div>

    <!-- EXECUTIVE REQUIREMENTS SATISFACTION SUMMARY -->
    <div class="section-block">
      <div class="section-heading">Executive Requirements & Features Satisfaction Matrix</div>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Module / Requirement</th>
            <th>Features Implemented & Demonstrated</th>
            <th>Verification Proof</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>User Registration</strong></td>
            <td>Full form validation, bcrypt password hashing, dual relational insertion (students + users)</td>
            <td>Figure 1.1 - 1.4</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Session Inactivity Timeout</strong></td>
            <td>10-minute zero-drift epoch timer, 60s warning modal, stay logged in extension & auto-redirect</td>
            <td>Figure 2.1 - 2.2</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Authentication & RBAC</strong></td>
            <td>Bcrypt verification, session fixation prevention, student/admin dynamic navigation, HTTP 403 barrier</td>
            <td>Figure 3.1 - 3.4</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Executive Admin Dashboard</strong></td>
            <td>Dynamic relational statistics, monthly chart, user active/inactive toggle, relational audit logging</td>
            <td>Figure 4.1 - 4.2</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Student Portal & Schedules</strong></td>
            <td>Personalized student dashboard, weekly timetable schedule, academic study materials repository</td>
            <td>Figure 5.1 - 5.3</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Student Directory & AJAX CRUD</strong></td>
            <td>Asynchronous add modal, debounced live search, course filters, instant CSV export</td>
            <td>Figure 6.1 - 6.3</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Campus Events Catalog</strong></td>
            <td>Card visualizer, poster validation, student event registration junction linking tables in 3NF</td>
            <td>Figure 7.1</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Responsive Mobile Viewport</strong></td>
            <td>Mobile layout testing on 390px (iPhone 14 Pro), accessible touch targets, collapsible menu</td>
            <td>Figure 8.1</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
          <tr>
            <td><strong>Local & Apache Deployment</strong></td>
            <td>Apache Virtual Host configuration (studenthub.local), MySQL database dump (studenthub.sql), Git origin</td>
            <td>Figure 9.1 - 9.3</td>
            <td><span class="badge-success">100% SATISFIED</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 1: SUCCESSFUL REGISTRATION -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">1. User Registration & Dual-Layer Validation</div>

      <div class="item-title">1.1 Student Registration Form Interface</div>
      <div class="item-desc">Initial clean state of the student registration gateway (register.php) featuring input fields for Full Name, University Email, Department, Password, and Password Confirmation in portal light mode.</div>
      <div class="screenshot-container">
        <img src="${images.regForm}" alt="Registration Form">
      </div>

      <div class="item-title">1.2 Registration Process: Form Filled with Student Data</div>
      <div class="item-desc">Registration form actively populated with student details (Dev Patel, CSE Department, credentials) demonstrating client-side validation checks before submission.</div>
      <div class="screenshot-container">
        <img src="${images.regFilled}" alt="Registration Form Filled">
      </div>
    </div>

    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">1. User Registration & Dual-Layer Validation (Contd.)</div>

      <div class="item-title">1.3 Successful User Registration & Relational MySQL Insertion</div>
      <div class="item-desc">Visual confirmation of successful registration: A green notification alert confirms student record creation with securely hashed bcrypt password in the MySQL database (students and users tables).</div>
      <div class="screenshot-container">
        <img src="${images.regSuccess}" alt="Registration Successful">
      </div>

      <div class="item-title">1.4 Server-Side Validation Error Handling (Password Mismatch)</div>
      <div class="item-desc">Demonstration of input validation safeguards: When password fields do not match, the portal displays a prominent validation notification preventing dirty data insertion.</div>
      <div class="screenshot-container">
        <img src="${images.regError}" alt="Registration Validation Error">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 2: SESSION TIMEOUT -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">2. 10-Minute Zero-Drift Session Security & Inactivity Timeout</div>

      <div class="item-title">2.1 Session Timeout Warning Modal (Countdown Timer & Extension Action)</div>
      <div class="item-desc">After 9 minutes of user inactivity, the portal triggers a non-intrusive warning modal displaying an active countdown (48s). Users can click "Stay Logged In (+10m)" to extend their session or "Log Out" to immediately terminate.</div>
      <div class="screenshot-container">
        <img src="${images.timeoutModal}" alt="Session Timeout Warning Modal">
      </div>

      <div class="item-title">2.2 Session Invalidation & Automatic Redirect to Sign-In</div>
      <div class="item-desc">Upon complete session expiration (10 minutes), the server-side epoch guard invalidates the session cookie and redirects the user to login.php?msg=timeout with a clear notification informing them of session termination.</div>
      <div class="screenshot-container">
        <img src="${images.timeoutRedirect}" alt="Session Expired Redirect">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 3: AUTHENTICATION & RBAC -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">3. Authentication Gateway & Role-Based Access Control (RBAC)</div>

      <div class="item-title">3.1 Authentication Gateway & Dual-Role Switcher</div>
      <div class="item-desc">Unified login portal (login.php) with instant role-switching pills (Student and Administrator), demo account prefill pills, remember-me token option, and clean light-themed inputs.</div>
      <div class="screenshot-container">
        <img src="${images.loginGateway}" alt="Login Gateway">
      </div>

      <div class="item-title">3.2 Role-Based Access Control Interception (HTTP 403 Forbidden Alert)</div>
      <div class="item-desc">Strict security barrier: When an authenticated Student (Jay Navadiya) attempts to access restricted Admin routes (/dashboard.php), the system intercepts the request, blocks execution with HTTP 403, and records an audit log.</div>
      <div class="screenshot-container">
        <img src="${images.rbac403}" alt="RBAC 403 Access Denied">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 4: ADMIN DASHBOARD & AUDIT LOGS -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">4. Executive Admin Control Center, Analytics & Audit Logging</div>

      <div class="item-title">4.1 Executive Admin Dashboard with Dynamic Statistics & Registration Chart</div>
      <div class="item-desc">Administrator overview (dashboard.php) featuring live database KPIs (4 Users, 25 Enrolled Students, 4 Events, 14 Registrations), latest relational registration feed, and Chart.js monthly analytics.</div>
      <div class="screenshot-container">
        <img src="${images.adminDashboard}" alt="Admin Dashboard Full Overview">
      </div>

      <div class="item-title">4.2 Relational Security Audit Trail (audit_logs Table Verification)</div>
      <div class="item-desc">Full traceability log tracking administrative actions and security violations (LOGIN_SUCCESS, USER_STATUS_TOGGLE, UNAUTHORIZED_ACCESS_403, EVENT_CREATE) with IP addresses and timestamps.</div>
      <div class="screenshot-container">
        <img src="${images.auditLogs}" alt="Admin Audit Logs">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 5: STUDENT PORTAL & SCHEDULES -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">5. Student Academic Portal, Schedule & Study Materials</div>

      <div class="item-title">5.1 Personalized Student Academic Dashboard (student_dashboard.php)</div>
      <div class="item-desc">Personalized student view for Jay Navadiya (B.Tech Computer Engineering) displaying academic status, registered event badges, and quick links to course resources.</div>
      <div class="screenshot-container">
        <img src="${images.studentDashboard}" alt="Student Dashboard">
      </div>

      <div class="item-title">5.2 Academic Class Timetable & Lab Allocations</div>
      <div class="item-desc">Weekly class timetable (timetable.php) displaying time slots, course codes (ITUE203, CE204), faculty names, and designated laboratory numbers.</div>
      <div class="screenshot-container">
        <img src="${images.timetable}" alt="Academic Timetable">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 6: STUDENT CRUD & AJAX -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">6. Student Directory Management & Asynchronous AJAX CRUD</div>

      <div class="item-title">6.1 Enrolled Students Directory Interface with Department Badges</div>
      <div class="item-desc">Student management directory (students.php) showing 3NF relational records with Department badges (CSE, CE, IT, EC), status badges, and action buttons.</div>
      <div class="screenshot-container">
        <img src="${images.studentCrud}" alt="Student CRUD Interface">
      </div>

      <div class="item-title">6.2 Asynchronous AJAX Add Student Modal Dialog</div>
      <div class="item-desc">AJAX Add Student modal dialog open in light theme mode, enabling seamless record insertion without reloading the page.</div>
      <div class="screenshot-container">
        <img src="${images.studentAddModal}" alt="AJAX Student Add Modal">
      </div>
    </div>

    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">6. Student Directory Management & Asynchronous AJAX CRUD (Contd.)</div>

      <div class="item-title">6.3 Live Keystroke Debounced Search & Department Filtering</div>
      <div class="item-desc">Real-time filtering: Typing search keywords ("Aditya") and selecting department ("CSE") instantly updates the records table via RESTful API queries without full page refresh.</div>
      <div class="screenshot-container">
        <img src="${images.studentSearchFilter}" alt="Live Search and Filter">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 7: CAMPUS EVENTS -->
    <!-- ======================================================== -->
    <div class="section-block">
      <div class="section-heading">7. Campus Events Catalog & Relational Registrations</div>

      <div class="item-title">7.1 Campus Events Catalog & Event Registration Junction</div>
      <div class="item-desc">Campus events catalog (events.php) showcasing event posters (Hackathon, AI Workshop, Code Wizards), venue schedules, and live registration buttons linked via 3NF foreign keys.</div>
      <div class="screenshot-container">
        <img src="${images.eventsCatalog}" alt="Events Catalog">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 8: RESPONSIVE MOBILE VIEWPORT -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">8. Responsive Mobile Accessibility & Viewport Layouts</div>

      <div class="item-title">8.1 Mobile Viewport Layout (iPhone 14 Pro / 390px Viewport)</div>
      <div class="item-desc">Demonstration of mobile responsiveness: Fluid card stacking, accessible touch navigation, and responsive typography ensuring seamless access on smart devices.</div>
      <div class="screenshot-container">
        <img src="${images.mobileView}" alt="Mobile Viewport Layout">
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SECTION 9: LOCAL DEPLOYMENT & GITHUB SUBMISSION -->
    <!-- ======================================================== -->
    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">9. Local Deployment, Database Dump & GitHub Submission</div>

      <div class="item-title">9.1 Apache Virtual Host Local Deployment (apache_studenthub_vhost.conf)</div>
      <div class="item-desc">Turnkey VirtualHost configuration for deploying StudentHub locally under the domain http://studenthub.local on Apache 2.4 / XAMPP with mod_rewrite activated.</div>
      <div class="screenshot-container">
        <img src="${images.vhostConfig}" alt="Apache Virtual Host Configuration">
      </div>

      <div class="item-title">9.2 MySQL studenthub Database Dump & Table Counts Verification</div>
      <div class="item-desc">Database verification proving full 3NF relational integrity: Table counts confirm 25 Students, 4 Events, 14 Registrations, 4 Users, and 25+ Audit Logs.</div>
      <div class="screenshot-container">
        <img src="${images.dbDump}" alt="MySQL Database Dump">
      </div>
    </div>

    <div class="page-break"></div>
    <div class="section-block">
      <div class="section-heading">9. Local Deployment, Database Dump & GitHub Submission (Contd.)</div>

      <div class="item-title">9.3 GitHub Repository Submission & Clean Git History</div>
      <div class="item-desc">Git terminal output confirming remote origin (git@github.com:cs-cspit/Student-Portal-25CS052.git), branch main up-to-date, and clear semantic commit history.</div>
      <div class="screenshot-container">
        <img src="${images.gitHistory}" alt="Git Clean History">
      </div>
    </div>

  </body>
  </html>
  `;

  const reportPage = await browser.newPage();
  await reportPage.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfPathPrac15 = path.join(DIR_PR15, '25CS052_Campusly_Prac15.pdf');
  const pdfPathRoot = path.join(__dirname, '25CS052_Campusly_Prac15.pdf');

  console.log(`Generating PDF to: ${pdfPathPrac15}...`);
  await reportPage.pdf({
    path: pdfPathPrac15,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-family: -apple-system, sans-serif; font-size: 8pt; color: #64748b; width: 100%; padding: 0 14mm; display: flex; justify-content: space-between; align-items: center;">
        <span>CSPIT &bull; CHARUSAT &bull; StudentHub (Campusly) Practical 15</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '12mm',
      bottom: '15mm',
      left: '14mm',
      right: '14mm'
    }
  });

  // Copy to project root as well
  fs.copyFileSync(pdfPathPrac15, pdfPathRoot);
  console.log(`✅ PDF successfully generated and saved to:
  1. ${pdfPathPrac15}
  2. ${pdfPathRoot}`);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1100']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100, deviceScaleFactor: 2 });

  await captureExtraScreenshots(page);
  await buildPdfReport(browser);

  await browser.close();
  console.log('🎉 Practical 15 PDF Report generation complete!');
}

main().catch((err) => {
  console.error('❌ Error generating Practical 15 PDF Report:', err);
  process.exit(1);
});
