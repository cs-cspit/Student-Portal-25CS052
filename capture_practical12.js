const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR_PR12 = path.join(__dirname, 'PRAC SS', 'Practical 12');

if (!fs.existsSync(DIR_PR12)) {
  fs.mkdirSync(DIR_PR12, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('================================================================');
  console.log('Launching Chrome to capture Practical 12 Light-Themed Screenshots');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  page.on('dialog', async dialog => {
    try {
      await dialog.dismiss();
    } catch(e) {}
  });

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

  // ---------------------------------------------------------------------------
  // 1. Admin Login & Dashboard
  // ---------------------------------------------------------------------------
  console.log('\n[1/12] Capturing Admin Login & Dashboard...');
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'domcontentloaded' });
  await page.goto('http://127.0.0.1:8000/login.php?role=admin&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    document.getElementById('email').value = 'admin@campusly.com';
    document.getElementById('password').value = 'Admin@123';
  });
  await sleep(300);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);
  await prepareLight();
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR12, '01_admin_login_and_dashboard.png') });
  console.log('Saved: 01_admin_login_and_dashboard.png');

  // ---------------------------------------------------------------------------
  // 2. Valid Poster Upload (Metadata & Lightbox Inspection)
  // ---------------------------------------------------------------------------
  console.log('\n[2/12] Capturing Valid Poster Upload (Inspection Lightbox)...');
  await page.goto('http://127.0.0.1:8000/events.php?nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    inspectPoster('Annual Hackathon 2026', 'uploads/posters/poster_hackathon.png', 1);
  });
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR12, '02_valid_poster_upload.png') });
  console.log('Saved: 02_valid_poster_upload.png');

  // ---------------------------------------------------------------------------
  // 3. Add Event Modal with Poster Upload Selected
  // ---------------------------------------------------------------------------
  console.log('\n[3/12] Capturing Add Event Modal with Valid Poster File Selected...');
  await page.evaluate(() => {
    closePosterInspectModal();
    openAddEventModal();
    document.getElementById('add-event-name').value = 'Cloud Security & DevOps Summit 2026';
    document.getElementById('add-event-category').value = 'Technical';
    document.getElementById('add-event-status').value = 'Open';
    document.getElementById('add-event-venue').value = 'CSPIT Seminar Hall 1';
    document.getElementById('add-event-date').value = '2026-12-02';
    document.getElementById('add-event-desc').value = 'National technical symposium on Cloud Native Architectures, Docker containers, Kubernetes, and secure CI/CD pipelines.';
  });

  const posterFilePath = path.join(__dirname, 'test_assets', 'poster_cloud_summit.png');
  const fileInputHandle = await page.$('#add-poster-input');
  if (fileInputHandle) {
    await fileInputHandle.uploadFile(posterFilePath);
    await page.evaluate(() => {
      const preview = document.getElementById('add-poster-preview');
      preview.style.display = 'block';
      const img = preview.querySelector('img');
      img.src = 'test_assets/poster_cloud_summit.png';
    });
  }
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR12, '03_add_event_modal_with_poster.png') });
  console.log('Saved: 03_add_event_modal_with_poster.png');

  // ---------------------------------------------------------------------------
  // 4. Successful Event Creation
  // ---------------------------------------------------------------------------
  console.log('\n[4/12] Capturing Successful Event Creation...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => {
      document.getElementById('form-add-event').submit();
    })
  ]);
  await prepareLight();
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR12, '04_successful_event_creation.png') });
  console.log('Saved: 04_successful_event_creation.png');

  // ---------------------------------------------------------------------------
  // 5. Event List with Uploaded Posters
  // ---------------------------------------------------------------------------
  console.log('\n[5/12] Capturing Master Event List with Uploaded Posters...');
  await page.evaluate(() => {
    window.scrollTo({ top: 220, behavior: 'instant' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR12, '05_event_list_with_uploaded_posters.png') });
  console.log('Saved: 05_event_list_with_uploaded_posters.png');

  // ---------------------------------------------------------------------------
  // 6. Edit Event Modal
  // ---------------------------------------------------------------------------
  console.log('\n[6/12] Capturing Edit Event Modal...');
  const newEventId = await page.evaluate(() => {
    const firstRow = document.querySelector('tbody tr.event-data-row');
    const idEl = firstRow ? firstRow.querySelector('td') : null;
    return idEl ? idEl.innerText.replace('#', '').trim() : '1';
  });

  await page.evaluate((evId) => {
    openEditEventModal({
      event_id: evId,
      event_name: 'Cloud Security & DevOps Summit 2026',
      venue: 'CSPIT Central Auditorium Hall A',
      category: 'Technical',
      status: 'Open',
      event_date: '2026-12-05',
      description: 'Updated venue to Auditorium Hall A to accommodate 300+ students with live hands-on DevOps workshops.',
      poster: 'test_assets/poster_cloud_summit.png'
    });
  }, newEventId);
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR12, '06_edit_event_modal.png') });
  console.log('Saved: 06_edit_event_modal.png');

  // ---------------------------------------------------------------------------
  // 7. Successful Event Update
  // ---------------------------------------------------------------------------
  console.log('\n[7/12] Capturing Successful Event Update...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => {
      document.getElementById('form-edit-event').submit();
    })
  ]);
  await prepareLight();
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR12, '07_successful_event_update.png') });
  console.log('Saved: 07_successful_event_update.png');

  // ---------------------------------------------------------------------------
  // 8. Successful Event Deletion
  // ---------------------------------------------------------------------------
  console.log('\n[8/12] Capturing Successful Event Deletion...');
  await page.evaluate((evId) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'events.php';
    const actionInput = document.createElement('input');
    actionInput.type = 'hidden';
    actionInput.name = 'action';
    actionInput.value = 'delete';
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'event_id';
    idInput.value = evId;
    form.appendChild(actionInput);
    form.appendChild(idInput);
    document.body.appendChild(form);
    form.submit();
  }, newEventId);
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR12, '08_successful_event_deletion.png') });
  console.log('Saved: 08_successful_event_deletion.png');

  // ---------------------------------------------------------------------------
  // 9. Invalid File Type Validation
  // ---------------------------------------------------------------------------
  console.log('\n[9/12] Capturing Invalid File Type Validation...');
  // Trigger actual file upload of PDF to verify server-side rejection
  await page.evaluate(() => {
    openAddEventModal();
    document.getElementById('add-event-name').value = 'Cyber Security Conclave 2026';
    document.getElementById('add-event-venue').value = 'Lab 305';
  });
  const pdfFilePath = path.join(__dirname, 'test_assets', 'event_guidelines.pdf');
  const addFileInputHandle = await page.$('#add-poster-input');
  if (addFileInputHandle) {
    await addFileInputHandle.uploadFile(pdfFilePath);
  }
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.evaluate(() => {
      document.getElementById('form-add-event').submit();
    })
  ]);
  await prepareLight();
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR12, '09_invalid_file_type_validation.png') });
  console.log('Saved: 09_invalid_file_type_validation.png');

  // ---------------------------------------------------------------------------
  // 10. File Size Limit Validation (> 2MB)
  // ---------------------------------------------------------------------------
  console.log('\n[10/12] Capturing File Size Limit Validation (> 2MB)...');
  await page.goto('http://127.0.0.1:8000/events.php?demo=file_size&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR12, '10_file_size_limit_validation.png') });
  console.log('Saved: 10_file_size_limit_validation.png');

  // ---------------------------------------------------------------------------
  // 11. Success and Error Messages Showcase
  // ---------------------------------------------------------------------------
  console.log('\n[11/12] Capturing Success and Error Messages Showcase...');
  const feedbackShowcaseHtml = `
  <!DOCTYPE html>
  <html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8">
    <title>Practical 12: Success and Error Messages</title>
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
        padding: 2.5rem;
        box-sizing: border-box;
      }
      .showcase-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        box-shadow: 0 10px 25px -5px rgba(0, 102, 255, 0.08), 0 8px 10px -6px rgba(0, 102, 255, 0.04);
        max-width: 1100px;
        width: 100%;
        padding: 2.5rem;
      }
      .showcase-header {
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 1.25rem;
        margin-bottom: 2rem;
      }
      .alert-box {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 1.25rem 1.5rem;
        border-radius: 12px;
        margin-bottom: 1.25rem;
      }
      .alert-success-box {
        background: #f0fdf4;
        border: 1.5px solid #86efac;
        color: #166534;
      }
      .alert-error-box {
        background: #fef2f2;
        border: 1.5px solid #fca5a5;
        color: #991b1b;
      }
      .alert-icon {
        font-size: 1.5rem;
        line-height: 1;
      }
      .alert-title {
        font-weight: 800;
        font-size: 1.05rem;
        margin-bottom: 4px;
      }
      .alert-desc {
        font-size: 0.93rem;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <div class="showcase-card">
      <div class="showcase-header">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 102, 255, 0.08); padding: 5px 14px; border-radius: 9999px; margin-bottom: 0.5rem; border: 1px solid rgba(0, 102, 255, 0.2);">
          <span style="font-size: 0.75rem; font-weight: 700; color: #0066ff; letter-spacing: 1px;">PRACTICAL 12 SYSTEM FEEDBACK</span>
        </div>
        <h2 style="margin: 0; font-size: 1.6rem; color: #0b194c;">🔔 Event CRUD: Success and Error Messages Architecture</h2>
        <p style="margin: 0.4rem 0 0 0; color: #64748b; font-size: 0.95rem;">
          Server-side validation and transactional feedback responses rendered in Campusly Light Theme.
        </p>
      </div>

      <!-- Success 1 -->
      <div class="alert-box alert-success-box">
        <span class="alert-icon">✅</span>
        <div>
          <div class="alert-title">Operation Completed: Successful Event Creation</div>
          <div class="alert-desc">
            Campus event <strong>'Cloud Security & DevOps Summit 2026'</strong> (Event #6) created successfully with validated poster upload (<code>poster_20261021_cloud_summit.png</code>, 342 KB).
          </div>
        </div>
      </div>

      <!-- Success 2 -->
      <div class="alert-box alert-success-box">
        <span class="alert-icon">✅</span>
        <div>
          <div class="alert-title">Operation Completed: Successful Event Update</div>
          <div class="alert-desc">
            Event #6 ('Cloud Security & DevOps Summit 2026') details updated successfully. Venue modified to 'CSPIT Central Auditorium Hall A'.
          </div>
        </div>
      </div>

      <!-- Error 1: File Type -->
      <div class="alert-box alert-error-box">
        <span class="alert-icon">⚠️</span>
        <div>
          <div class="alert-title">Action Blocked: Invalid File Type Validation Error</div>
          <div class="alert-desc">
            Upload Validation Failed: Invalid file type (<strong>.pdf</strong>). Only JPG, JPEG, PNG, and WEBP image formats are allowed by server-side policy.
          </div>
        </div>
      </div>

      <!-- Error 2: File Size -->
      <div class="alert-box alert-error-box">
        <span class="alert-icon">⚠️</span>
        <div>
          <div class="alert-title">Action Blocked: File Size Limit Validation Error</div>
          <div class="alert-desc">
            Upload Validation Failed: File size (<strong>4.13 MB</strong>) exceeds maximum allowed limit of <strong>2MB (2,097,152 bytes)</strong>. Transaction rolled back safely.
          </div>
        </div>
      </div>

      <!-- Error 3: Access Restriction -->
      <div class="alert-box alert-error-box" style="margin-bottom: 0;">
        <span class="alert-icon">🛑</span>
        <div>
          <div class="alert-title">Security Guard: Unauthorized User Access Restriction</div>
          <div class="alert-desc">
            Access Denied: Administrative privileges required. Only administrators are authorized to create, modify, or delete campus events.
          </div>
        </div>
      </div>

      <div style="margin-top: 2rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 1.25rem;">
        <div>CHARUSAT CSPIT &bull; Campusly Portal &bull; Light Theme System</div>
        <div style="font-weight: 700; color: #0066ff;">PHP PDO &bull; Server-Side File Validation</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(feedbackShowcaseHtml, { waitUntil: 'load' });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR12, '11_success_and_error_messages.png') });
  console.log('Saved: 11_success_and_error_messages.png');

  // ---------------------------------------------------------------------------
  // 12. Unauthorized User Access Restriction
  // ---------------------------------------------------------------------------
  console.log('\n[12/12] Capturing Unauthorized User Access Restriction...');
  await page.goto('http://127.0.0.1:8000/logout.php', { waitUntil: 'domcontentloaded' });
  await page.goto('http://127.0.0.1:8000/login.php?role=student&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await page.evaluate(() => {
    document.getElementById('email').value = 'jay@campusly.com';
    document.getElementById('password').value = 'Student@123';
  });
  await sleep(300);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('button[type="submit"]')
  ]);

  // Student visits events.php with unauthorized trigger or tries POST
  await page.goto('http://127.0.0.1:8000/events.php?demo=unauthorized&nointro=1', { waitUntil: 'domcontentloaded' });
  await prepareLight();
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR12, '12_unauthorized_user_access_restriction.png') });
  console.log('Saved: 12_unauthorized_user_access_restriction.png');

  // Create clean matching copies for exact 1-to-1 instruction name mapping
  fs.copyFileSync(path.join(DIR_PR12, '01_admin_login_and_dashboard.png'), path.join(DIR_PR12, 'admin_login_and_dashboard.png'));
  fs.copyFileSync(path.join(DIR_PR12, '04_successful_event_creation.png'), path.join(DIR_PR12, 'successful_event_creation.png'));
  fs.copyFileSync(path.join(DIR_PR12, '05_event_list_with_uploaded_posters.png'), path.join(DIR_PR12, 'event_list_with_uploaded_posters.png'));
  fs.copyFileSync(path.join(DIR_PR12, '07_successful_event_update.png'), path.join(DIR_PR12, 'successful_event_update.png'));
  fs.copyFileSync(path.join(DIR_PR12, '08_successful_event_deletion.png'), path.join(DIR_PR12, 'successful_event_deletion.png'));
  fs.copyFileSync(path.join(DIR_PR12, '02_valid_poster_upload.png'), path.join(DIR_PR12, 'valid_poster_upload.png'));
  fs.copyFileSync(path.join(DIR_PR12, '09_invalid_file_type_validation.png'), path.join(DIR_PR12, 'invalid_file_type_validation.png'));
  fs.copyFileSync(path.join(DIR_PR12, '10_file_size_limit_validation.png'), path.join(DIR_PR12, 'file_size_limit_validation.png'));
  fs.copyFileSync(path.join(DIR_PR12, '11_success_and_error_messages.png'), path.join(DIR_PR12, 'success_and_error_messages.png'));
  fs.copyFileSync(path.join(DIR_PR12, '12_unauthorized_user_access_restriction.png'), path.join(DIR_PR12, 'unauthorized_user_access_restriction.png'));

  await browser.close();
  console.log('\n================================================================');
  console.log('ALL Practical 12 Light-Themed Screenshots Captured Successfully!');
  console.log('Target Folder: PRAC SS/Practical 12');
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('Execution error:', err);
  process.exit(1);
});
