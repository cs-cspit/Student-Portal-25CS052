const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIR_PR13 = path.join(__dirname, 'PRAC SS', 'Practical 13');

if (!fs.existsSync(DIR_PR13)) {
  fs.mkdirSync(DIR_PR13, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('Launching Headless Chrome for Practical 13 screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1600,1100',
      '--force-device-scale-factor=2'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100, deviceScaleFactor: 2 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Ensure light mode is forced
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('campusly_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  });

  const url = 'http://127.0.0.1:8000/index.html';

  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await sleep(800);

  // Helper to ensure clean light theme
  async function forceLight() {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#f8fafc';
    });
    await sleep(200);
  }

  // =========================================================================
  // 1. UI: List Student Records (GET /api.php loaded)
  // =========================================================================
  console.log('1. Capturing 01_student_list_interface.png...');
  await forceLight();
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '01_student_list_interface.png') });

  // =========================================================================
  // 2. UI: Add Student Modal (Blank)
  // =========================================================================
  console.log('2. Capturing 02_add_student_modal.png...');
  await page.evaluate(() => {
    openAddModal();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR13, '02_add_student_modal.png') });

  // =========================================================================
  // 3. UI: Add Student Form Filled
  // =========================================================================
  console.log('3. Capturing 03_add_student_form_filled.png...');
  const newEmail = `pooja.trivedi@charusat.edu.in`;
  await page.evaluate((email) => {
    document.getElementById('form-name').value = 'Pooja Trivedi';
    document.getElementById('form-email').value = email;
    document.getElementById('form-course').value = 'CSE';
    document.getElementById('form-status').value = 'Active';
  }, newEmail);
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '03_add_student_form_filled.png') });

  // =========================================================================
  // 4. UI: Add Student Success (POST via Fetch API)
  // =========================================================================
  console.log('4. Capturing 04_add_student_success.png...');
  await page.evaluate(() => {
    document.getElementById('student-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await sleep(1000); // Wait for fetch POST and table re-render
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '04_add_student_success.png') });

  // =========================================================================
  // 5. UI: Edit Student Modal (Populated via Fetch GET)
  // =========================================================================
  console.log('5. Capturing 05_edit_student_modal.png...');
  // Find first row edit button
  await page.evaluate(() => {
    const firstEditBtn = document.querySelector('.btn-edit');
    if (firstEditBtn) firstEditBtn.click();
  });
  await sleep(600);
  // Modify course and name
  await page.evaluate(() => {
    const nameInput = document.getElementById('form-name');
    nameInput.value = 'Pooja Trivedi (Honors)';
    document.getElementById('form-course').value = 'CE';
  });
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '05_edit_student_modal.png') });

  // =========================================================================
  // 6. UI: Edit Student Success (PUT via Fetch API)
  // =========================================================================
  console.log('6. Capturing 06_edit_student_success.png...');
  await page.evaluate(() => {
    document.getElementById('student-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await sleep(1000); // Wait for fetch PUT and re-render
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '06_edit_student_success.png') });

  // =========================================================================
  // 7. UI: Delete Confirmation Modal
  // =========================================================================
  console.log('7. Capturing 07_delete_student_confirmation_modal.png...');
  await page.evaluate(() => {
    const firstDeleteBtn = document.querySelector('.btn-delete');
    if (firstDeleteBtn) firstDeleteBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(DIR_PR13, '07_delete_student_confirmation_modal.png') });

  // =========================================================================
  // 8. UI: Delete Student Success (DELETE via Fetch API)
  // =========================================================================
  console.log('8. Capturing 08_delete_student_success.png...');
  await page.click('#btn-confirm-delete');
  await sleep(1000); // Wait for fetch DELETE animation and table reload
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '08_delete_student_success.png') });

  // =========================================================================
  // 9. UI: Loading State
  // =========================================================================
  console.log('9. Capturing 09_loading_state.png...');
  await page.evaluate(() => {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('table-wrapper').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
  });
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '09_loading_state.png') });
  // Restore normal table
  await page.evaluate(() => {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('table-wrapper').style.display = 'block';
  });

  // =========================================================================
  // 10. UI: Error State - Client-Side Validation
  // =========================================================================
  console.log('10. Capturing 10_error_state_client_validation.png...');
  await page.evaluate(() => {
    openAddModal();
    document.getElementById('form-name').value = '';
    document.getElementById('form-email').value = 'invalid-email-address';
    document.getElementById('student-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR13, '10_error_state_client_validation.png') });

  // =========================================================================
  // 11. UI: Error State - Server-Side 409 Conflict (Duplicate Email)
  // =========================================================================
  console.log('11. Capturing 11_error_state_duplicate_conflict.png...');
  await page.evaluate(() => {
    document.getElementById('form-name').value = 'Jay Navadiya Duplicate';
    document.getElementById('form-email').value = 'jay@campusly.com'; // Existing email
    document.getElementById('student-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  await sleep(900); // Wait for API response 409 Conflict
  await page.screenshot({ path: path.join(DIR_PR13, '11_error_state_duplicate_conflict.png') });
  await page.evaluate(() => closeModal());
  await sleep(300);

  // =========================================================================
  // 12. UI: Intermediate Extension - AJAX Search with 300ms Debounce
  // =========================================================================
  console.log('12. Capturing 12_ajax_search_debounce.png...');
  await page.evaluate(() => {
    const searchInput = document.getElementById('search-input');
    searchInput.focus();
    searchInput.value = 'Jay';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await sleep(700); // Wait for debounce and fetch
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '12_ajax_search_debounce.png') });

  // Clear search for subsequent views
  await page.evaluate(() => {
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await sleep(700);

  // =========================================================================
  // 13. NETWORK TAB: Overview of Fetch Requests & Status Codes
  // =========================================================================
  console.log('13. Capturing 13_network_tab_overview_all_requests.png...');
  // Scroll down so the DevTools Network panel is prominently in view
  await page.evaluate(() => {
    const devtools = document.getElementById('devtools-section');
    devtools.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR13, '13_network_tab_overview_all_requests.png') });

  // =========================================================================
  // 14. NETWORK TAB: Fetch GET Details & Response JSON
  // =========================================================================
  console.log('14. Capturing 14_network_tab_fetch_get_response.png...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#dt-requests-tbody tr'));
    const getRow = rows.find(r => r.innerText.includes('GET'));
    if (getRow) getRow.click();
    const tabs = document.querySelectorAll('.dt-subtab');
    const respTab = Array.from(tabs).find(t => t.innerText.includes('JSON Response'));
    if (respTab) respTab.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR13, '14_network_tab_fetch_get_response.png') });

  // =========================================================================
  // 15. NETWORK TAB: Fetch POST 201 Created & Payload / Response
  // =========================================================================
  console.log('15. Capturing 15_network_tab_fetch_post_payload_201.png...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#dt-requests-tbody tr'));
    const postRow = rows.find(r => r.innerText.includes('POST') && r.innerText.includes('201'));
    if (postRow) postRow.click();
    const tabs = document.querySelectorAll('.dt-subtab');
    const respTab = Array.from(tabs).find(t => t.innerText.includes('JSON Response'));
    if (respTab) respTab.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR13, '15_network_tab_fetch_post_payload_201.png') });

  // =========================================================================
  // 16. NETWORK TAB: Fetch PUT 200 OK & Payload
  // =========================================================================
  console.log('16. Capturing 16_network_tab_fetch_put_payload_200.png...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#dt-requests-tbody tr'));
    const putRow = rows.find(r => r.innerText.includes('PUT') && r.innerText.includes('200'));
    if (putRow) putRow.click();
    const tabs = document.querySelectorAll('.dt-subtab');
    const respTab = Array.from(tabs).find(t => t.innerText.includes('JSON Response'));
    if (respTab) respTab.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR13, '16_network_tab_fetch_put_payload_200.png') });

  // =========================================================================
  // 17. NETWORK TAB: Fetch DELETE 200 OK
  // =========================================================================
  console.log('17. Capturing 17_network_tab_fetch_delete_200.png...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#dt-requests-tbody tr'));
    const delRow = rows.find(r => r.innerText.includes('DELETE') && r.innerText.includes('200'));
    if (delRow) delRow.click();
    const tabs = document.querySelectorAll('.dt-subtab');
    const respTab = Array.from(tabs).find(t => t.innerText.includes('JSON Response'));
    if (respTab) respTab.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR13, '17_network_tab_fetch_delete_200.png') });

  // =========================================================================
  // 18. NETWORK TAB: Fetch 409 Conflict Error JSON Response
  // =========================================================================
  console.log('18. Capturing 18_network_tab_fetch_error_409_conflict.png...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#dt-requests-tbody tr'));
    const errRow = rows.find(r => r.innerText.includes('409'));
    if (errRow) errRow.click();
    const tabs = document.querySelectorAll('.dt-subtab');
    const respTab = Array.from(tabs).find(t => t.innerText.includes('JSON Response'));
    if (respTab) respTab.click();
  });
  await sleep(400);
  await page.screenshot({ path: path.join(DIR_PR13, '18_network_tab_fetch_error_409_conflict.png') });

  // =========================================================================
  // 19. RAW API ENDPOINT: Direct GET /api.php Response in Browser
  // =========================================================================
  console.log('19. Capturing 19_raw_api_php_json_endpoint.png...');
  await page.goto('http://127.0.0.1:8000/api.php', { waitUntil: 'domcontentloaded' });
  await sleep(400);
  await page.evaluate(() => {
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#0b194c';
    document.body.style.fontFamily = "'JetBrains Mono', Menlo, monospace";
    document.body.style.fontSize = "14px";
    document.body.style.padding = "24px";
    document.body.style.lineHeight = "1.6";
  });
  await sleep(300);
  await page.screenshot({ path: path.join(DIR_PR13, '19_raw_api_php_json_endpoint.png') });

  console.log('All screenshots captured successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
