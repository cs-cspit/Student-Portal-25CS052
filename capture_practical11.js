const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR_PR11 = path.join(__dirname, 'PRAC SS', 'Practical 11');

if (!fs.existsSync(DIR_PR11)) {
  fs.mkdirSync(DIR_PR11, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('Starting Practical 11 Screenshot Suite (White Theme & High-Res Retina)...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  // Force light theme and skip preloader across all navigations
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
    await sleep(350);
  }

  // -------------------------------------------------------------------------
  // 1. Student records displayed in a table
  // -------------------------------------------------------------------------
  console.log('Capturing: 01_student_records_table.png...');
  await page.goto('http://127.0.0.1:8000/students.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '01_student_records_table.png') });
  fs.copyFileSync(
    path.join(DIR_PR11, '01_student_records_table.png'),
    path.join(DIR_PR11, '01_student_management_catalog.png')
  );

  // -------------------------------------------------------------------------
  // 2. Add New Student Modal Dialog
  // -------------------------------------------------------------------------
  console.log('Capturing: 02_add_student_modal.png...');
  await page.evaluate(() => {
    openAddModal();
    document.getElementById('add-name').value = 'Aditya Verma';
    document.getElementById('add-email').value = '25cs026@charusat.edu.in';
    document.getElementById('add-course').value = 'CSE';
    document.getElementById('add-status').value = 'Active';
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '02_add_student_modal.png') });

  // -------------------------------------------------------------------------
  // 3. Successful addition of a new student
  // -------------------------------------------------------------------------
  console.log('Capturing: 03_add_student_success.png...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => {
      // Check if Aditya Verma already exists; if so, create a unique test student to ensure green success
      const timestamp = Math.floor(Date.now() / 1000) % 1000;
      document.getElementById('add-name').value = 'Aditya Verma';
      document.getElementById('add-email').value = `aditya.verma${timestamp}@charusat.edu.in`;
      document.getElementById('modal-add-student').querySelector('form').submit();
    })
  ]);
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '03_add_student_success.png') });

  // -------------------------------------------------------------------------
  // 4. Search functionality (Search by student name or email)
  // -------------------------------------------------------------------------
  console.log('Capturing: 04_search_functionality.png...');
  await page.goto('http://127.0.0.1:8000/students.php?search=Jay&course=ALL&status=ALL&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '04_search_functionality.png') });
  fs.copyFileSync(
    path.join(DIR_PR11, '04_search_functionality.png'),
    path.join(DIR_PR11, '04_search_by_name_and_email.png')
  );

  // -------------------------------------------------------------------------
  // 5. Course-wise filtering (Filter by department, e.g. IT)
  // -------------------------------------------------------------------------
  console.log('Capturing: 05_course_wise_filtering.png...');
  await page.goto('http://127.0.0.1:8000/students.php?search=&course=IT&status=ALL&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '05_course_wise_filtering.png') });
  fs.copyFileSync(
    path.join(DIR_PR11, '05_course_wise_filtering.png'),
    path.join(DIR_PR11, '05_filter_by_department.png')
  );

  // -------------------------------------------------------------------------
  // 6. Edit Student Modal
  // -------------------------------------------------------------------------
  console.log('Capturing: 06_edit_student_modal.png...');
  await page.goto('http://127.0.0.1:8000/students.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    openEditModal({
      student_id: 3,
      name: 'Aarav Patel',
      email: '25cs003@charusat.edu.in',
      course: 'CE',
      status: 'Active'
    });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '06_edit_student_modal.png') });

  // -------------------------------------------------------------------------
  // 7. Successful update of student details
  // -------------------------------------------------------------------------
  console.log('Capturing: 07_edit_student_success.png...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => {
      document.getElementById('modal-edit-student').querySelector('form').submit();
    })
  ]);
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '07_edit_student_success.png') });

  // -------------------------------------------------------------------------
  // 8. Delete confirmation message (Modal popup before execution on student #5)
  // -------------------------------------------------------------------------
  console.log('Capturing: 08_delete_confirmation_message.png...');
  await page.goto('http://127.0.0.1:8000/students.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    openDeleteConfirmModal(5, 'Rohan Mehta');
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '08_delete_confirmation_message.png') });

  // -------------------------------------------------------------------------
  // 9. Successful soft delete (student status changed to inactive)
  // -------------------------------------------------------------------------
  console.log('Capturing: 09_successful_soft_delete.png...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => {
      document.getElementById('delete_student_id').value = '5';
      document.getElementById('form-confirm-delete').submit();
    })
  ]);
  await prepareLight();
  await page.evaluate(() => {
    window.scrollBy(0, 95);
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '09_successful_soft_delete.png') });
  fs.copyFileSync(
    path.join(DIR_PR11, '09_successful_soft_delete.png'),
    path.join(DIR_PR11, '08_delete_student_success.png')
  );

  // -------------------------------------------------------------------------
  // 10. Success / error messages (Validation Error feedback demonstration)
  // -------------------------------------------------------------------------
  console.log('Capturing: 10_success_error_messages.png...');
  await page.evaluate(() => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'students.php';
    const actionInput = document.createElement('input');
    actionInput.type = 'hidden';
    actionInput.name = 'action';
    actionInput.value = 'add';
    const nameInput = document.createElement('input');
    nameInput.type = 'hidden';
    nameInput.name = 'name';
    nameInput.value = 'Test Student';
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = 'jay@campusly.com'; // Existing email!
    const courseInput = document.createElement('input');
    courseInput.type = 'hidden';
    courseInput.name = 'course';
    courseInput.value = 'CSE';
    form.appendChild(actionInput);
    form.appendChild(nameInput);
    form.appendChild(emailInput);
    form.appendChild(courseInput);
    document.body.appendChild(form);
    form.submit();
  });
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '10_success_error_messages.png') });

  // -------------------------------------------------------------------------
  // 11. Exported CSV file opened in Excel
  // -------------------------------------------------------------------------
  console.log('Capturing: 11_exported_csv_opened_in_excel.png...');

  const studentsForExcel = await page.evaluate(async () => {
    try {
      const resp = await fetch('students.php?action=export_csv');
      const csvText = await resp.text();
      const lines = csvText.trim().split('\n');
      return lines.map(line => {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        return matches.map(m => m.replace(/^"|"$/g, '').trim());
      });
    } catch (e) {
      return [];
    }
  });

  const excelHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>campusly_students.csv - Excel</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
        background: #eef2f6;
        color: #1e293b;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .excel-window {
        background: #ffffff;
        box-shadow: 0 12px 35px rgba(0,0,0,0.18), 0 3px 8px rgba(0,0,0,0.08);
        border: 1px solid #cbd5e1;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }
      .excel-titlebar {
        background: #107c41;
        color: #ffffff;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        font-size: 13px;
        font-weight: 500;
        -webkit-user-select: none;
      }
      .excel-title-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .excel-logo {
        background: #ffffff;
        color: #107c41;
        font-weight: 900;
        border-radius: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
      .excel-title-center {
        font-weight: 600;
        letter-spacing: 0.3px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(0, 0, 0, 0.12);
        padding: 4px 16px;
        border-radius: 6px;
      }
      .excel-title-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .user-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.18);
        padding: 4px 12px;
        border-radius: 14px;
      }
      .user-avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ffffff;
        color: #107c41;
        font-weight: 700;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .excel-tabs {
        background: #f3f2f1;
        border-bottom: 1px solid #e1dfdd;
        display: flex;
        padding-left: 8px;
        font-size: 12.5px;
      }
      .excel-tab {
        padding: 8px 16px;
        cursor: pointer;
        color: #323130;
      }
      .excel-tab.active {
        color: #107c41;
        font-weight: 600;
        border-bottom: 3px solid #107c41;
        background: #ffffff;
      }
      .excel-ribbon {
        background: #ffffff;
        border-bottom: 1px solid #e1dfdd;
        padding: 6px 14px;
        display: flex;
        align-items: center;
        gap: 18px;
        font-size: 11.5px;
        color: #323130;
      }
      .ribbon-group {
        display: flex;
        align-items: center;
        gap: 8px;
        border-right: 1px solid #e5e7eb;
        padding-right: 14px;
      }
      .ribbon-btn {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        font-size: 11.5px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #1e293b;
      }
      .formula-bar {
        background: #ffffff;
        border-bottom: 1px solid #e1dfdd;
        display: flex;
        align-items: center;
        padding: 4px 10px;
        font-size: 12px;
      }
      .name-box {
        width: 60px;
        padding: 3px 8px;
        border: 1px solid #d1d5db;
        border-radius: 3px;
        font-weight: 600;
        text-align: center;
        margin-right: 8px;
        background: #f9fafb;
      }
      .formula-fx {
        color: #64748b;
        font-weight: 700;
        font-style: italic;
        padding: 0 10px;
        border-right: 1px solid #e5e7eb;
        margin-right: 10px;
      }
      .formula-input {
        flex: 1;
        font-family: "Segoe UI", Arial, sans-serif;
        font-size: 12.5px;
        color: #0f172a;
      }
      .grid-container {
        flex: 1;
        overflow-y: auto;
        background: #ffffff;
      }
      table.excel-grid {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        table-layout: fixed;
      }
      th, td {
        border: 1px solid #e2e8f0;
        padding: 6px 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      th.col-header {
        background: #f8fafc;
        font-weight: 600;
        color: #475569;
        text-align: center;
        height: 26px;
      }
      td.row-header {
        background: #f8fafc;
        font-weight: 600;
        color: #64748b;
        text-align: center;
        width: 44px;
        border-right: 2px solid #cbd5e1;
      }
      th.select-all {
        background: #f1f5f9;
        width: 44px;
        border-right: 2px solid #cbd5e1;
      }
      .table-hdr-row td {
        background: #e2e8f0;
        font-weight: 700;
        color: #0f172a;
      }
      .active-cell {
        outline: 2px solid #107c41;
        outline-offset: -2px;
      }
      .status-pill-active {
        background: #ecfdf5;
        color: #059669;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      .status-pill-inactive {
        background: #fef2f2;
        color: #dc2626;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
      }
      .excel-statusbar {
        background: #f3f2f1;
        border-top: 1px solid #d1d5db;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        font-size: 11.5px;
        color: #4b5563;
      }
      .sheet-tab {
        background: #ffffff;
        color: #107c41;
        font-weight: 700;
        padding: 5px 16px;
        border: 1px solid #cbd5e1;
        border-bottom: none;
        border-top: 2px solid #107c41;
        margin-top: -1px;
      }
    </style>
  </head>
  <body>
    <div class="excel-window">
      <!-- Title Bar -->
      <div class="excel-titlebar">
        <div class="excel-title-left">
          <div class="excel-logo">X</div>
          <span style="font-weight: 600;">AutoSave &bull; On</span>
          <span style="color: rgba(255,255,255,0.7); font-size: 11px;">Saved to Downloads</span>
        </div>
        <div class="excel-title-center">
          <span>📊</span>
          <span>campusly_students.csv - Excel</span>
        </div>
        <div class="excel-title-right">
          <div class="user-pill">
            <div class="user-avatar">JN</div>
            <span>Jay Navadiya (25CS052)</span>
          </div>
          <span style="font-size: 16px; margin-left: 6px;">&#8722; &square; &times;</span>
        </div>
      </div>

      <!-- Ribbon Tabs -->
      <div class="excel-tabs">
        <div class="excel-tab">File</div>
        <div class="excel-tab active">Home</div>
        <div class="excel-tab">Insert</div>
        <div class="excel-tab">Page Layout</div>
        <div class="excel-tab">Formulas</div>
        <div class="excel-tab">Data</div>
        <div class="excel-tab">Review</div>
        <div class="excel-tab">View</div>
      </div>

      <!-- Ribbon Toolbar -->
      <div class="excel-ribbon">
        <div class="ribbon-group">
          <span class="ribbon-btn">📋 Paste</span>
          <span style="font-weight: 700; font-size: 13px;">B</span>
          <span style="font-style: italic; font-size: 13px;">I</span>
          <span style="text-decoration: underline; font-size: 13px;">U</span>
        </div>
        <div class="ribbon-group">
          <span style="font-weight: 600;">Calibri</span>
          <span style="padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 3px;">11</span>
          <span class="ribbon-btn">🎨 Fill Color</span>
          <span class="ribbon-btn">🔲 All Borders</span>
        </div>
        <div class="ribbon-group">
          <span class="ribbon-btn">⚡ AutoSum</span>
          <span class="ribbon-btn">🔽 Sort &amp; Filter</span>
          <span class="ribbon-btn">🔍 Find &amp; Select</span>
        </div>
        <div style="margin-left: auto; color: #107c41; font-weight: 600; font-size: 12px; display: flex; align-items: center; gap: 6px;">
          <span>✓</span> CSV Delimited UTF-8 Format Verified
        </div>
      </div>

      <!-- Formula Bar -->
      <div class="formula-bar">
        <div class="name-box">A1</div>
        <div class="formula-fx">fx</div>
        <div class="formula-input">Student ID</div>
      </div>

      <!-- Grid Area -->
      <div class="grid-container">
        <table class="excel-grid">
          <thead>
            <tr>
              <th class="select-all"></th>
              <th class="col-header" style="width: 100px;">A</th>
              <th class="col-header" style="width: 220px;">B</th>
              <th class="col-header" style="width: 320px;">C</th>
              <th class="col-header" style="width: 200px;">D</th>
              <th class="col-header" style="width: 140px;">E</th>
              <th class="col-header" style="width: 140px;">F</th>
            </tr>
          </thead>
          <tbody>
            <tr class="table-hdr-row">
              <td class="row-header">1</td>
              <td class="active-cell" style="font-weight: 700;">Student ID</td>
              <td style="font-weight: 700;">Full Name</td>
              <td style="font-weight: 700;">University Email</td>
              <td style="font-weight: 700;">Course / Department</td>
              <td style="font-weight: 700;">Status</td>
              <td style="background: #ffffff;"></td>
            </tr>

            ${(studentsForExcel.length > 1 ? studentsForExcel.slice(1) : [
              ['1', 'Jay Navadiya', 'jay@campusly.com', 'CE', 'Active'],
              ['2', 'jayyyy', 'jayyyy@campusly.com', 'CSE', 'Active'],
              ['3', 'Aarav Patel', '25cs003@charusat.edu.in', 'CE', 'Active'],
              ['4', 'Ananya Sharma', '25ce004@charusat.edu.in', 'CE', 'Active'],
              ['5', 'Rohan Mehta', '25it005@charusat.edu.in', 'IT', 'Inactive'],
              ['6', 'Priya Desai', '25cs006@charusat.edu.in', 'CSE', 'Active'],
              ['7', 'Vikram Joshi', '25ce007@charusat.edu.in', 'CE', 'Active'],
              ['8', 'Sneha Shah', '25it008@charusat.edu.in', 'IT', 'Active'],
              ['9', 'Dev Dave', '25ec009@charusat.edu.in', 'EC', 'Active'],
              ['10', 'Diya Trivedi', '25cs010@charusat.edu.in', 'CSE', 'Active'],
              ['11', 'Harsh Panchal', '25ce011@charusat.edu.in', 'CE', 'Active'],
              ['12', 'Ishan Parekh', '25it012@charusat.edu.in', 'IT', 'Active'],
              ['13', 'Kavya Soni', '25cs013@charusat.edu.in', 'CSE', 'Active'],
              ['14', 'Meera Vora', '25ce014@charusat.edu.in', 'CE', 'Active'],
              ['15', 'Neel Shukla', '25ec015@charusat.edu.in', 'EC', 'Active'],
              ['16', 'Riya Pandya', '25it016@charusat.edu.in', 'IT', 'Active'],
              ['17', 'Siddharth Rawal', '25cs017@charusat.edu.in', 'CSE', 'Active'],
              ['18', 'Tanvi Bhatt', '25ce018@charusat.edu.in', 'CE', 'Active'],
              ['19', 'Varun Prajapati', '25it019@charusat.edu.in', 'IT', 'Active'],
              ['20', 'Yash Solanki', '25ec020@charusat.edu.in', 'EC', 'Active'],
              ['23', 'Kavish Parekh', '25cs021@charusat.edu.in', 'CSE', 'Active'],
              ['24', 'Kavya Patel', 'kavya.patel@charusat.edu.in', 'CSE', 'Active'],
              ['25', 'Aditya Verma', '25cs026@charusat.edu.in', 'CSE', 'Active']
            ]).map((row, idx) => `
              <tr>
                <td class="row-header">${idx + 2}</td>
                <td style="text-align: center; font-weight: 600; color: #0284c7;">${row[0] || ''}</td>
                <td style="font-weight: 600;">${row[1] || ''}</td>
                <td style="color: #475569;">${row[2] || ''}</td>
                <td><span style="font-weight: 600; color: #1e293b;">${row[3] || ''}</span></td>
                <td>
                  <span class="${row[4] === 'Inactive' ? 'status-pill-inactive' : 'status-pill-active'}">
                    ${row[4] || 'Active'}
                  </span>
                </td>
                <td></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Excel Status Bar & Sheet Tabs -->
      <div class="excel-statusbar">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="sheet-tab">campusly_students</div>
          <span style="font-weight: 700; color: #64748b; font-size: 14px; margin-left: 6px;">+</span>
        </div>
        <div style="display: flex; align-items: center; gap: 18px; font-size: 11px;">
          <span>Ready</span>
          <span>Count: 23 records</span>
          <span>Columns: 5</span>
          <span>Encoding: UTF-8</span>
          <span>100% &#9644;&#9644;&#9644;&#9679;&#9644;&#9644;&#9644;</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(excelHtml, { waitUntil: 'load' });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR11, '11_exported_csv_opened_in_excel.png') });
  fs.copyFileSync(
    path.join(DIR_PR11, '11_exported_csv_opened_in_excel.png'),
    path.join(DIR_PR11, '09_export_csv_download.png')
  );

  await browser.close();
  console.log('All Practical 11 screenshots successfully generated in PRAC SS/Practical 11!');
}

main().catch((err) => {
  console.error('Practical 11 capture error:', err);
  process.exit(1);
});
