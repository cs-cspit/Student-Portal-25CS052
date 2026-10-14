const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(__dirname, 'PRAC SS', 'Practical 9');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  async function preparePage() {
    await page.evaluate(() => {
      sessionStorage.setItem('campusly_intro_played', '1');
      localStorage.setItem('campusly_theme', 'dark');
      const intro = document.getElementById('campusly-intro-preloader');
      if (intro) intro.remove();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  // 1. Registration Interface
  console.log('Capturing 01_registration_interface.png...');
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '01_registration_interface.png'), fullPage: false });

  // 2. Empty-Field Validation
  console.log('Capturing 02_empty_field_validation.png...');
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.evaluate(() => {
    document.getElementById('fullname').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirm_password').value = '';
    document.getElementById('registration-form').submit();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '02_empty_field_validation.png'), fullPage: false });

  // 3. Invalid Email Validation
  console.log('Capturing 03_invalid_email_validation.png...');
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.evaluate(() => {
    document.getElementById('fullname').value = 'Jay Navadiya';
    document.getElementById('email').value = 'student-invalid-email-format';
    document.getElementById('department').value = 'CSE';
    document.getElementById('password').value = 'Student@123';
    document.getElementById('confirm_password').value = 'Student@123';
    document.getElementById('registration-form').submit();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '03_invalid_email_validation.png'), fullPage: false });

  // 4. Password Mismatch Validation
  console.log('Capturing 04_password_mismatch_validation.png...');
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.evaluate(() => {
    document.getElementById('fullname').value = 'Jay Navadiya';
    document.getElementById('email').value = 'jay.new@charusat.edu.in';
    document.getElementById('department').value = 'CSE';
    document.getElementById('password').value = 'Student@123';
    document.getElementById('confirm_password').value = 'Mismatch@999';
    document.getElementById('registration-form').submit();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '04_password_mismatch_validation.png'), fullPage: false });

  // 5. Duplicate Email Validation
  console.log('Capturing 05_duplicate_email_validation.png...');
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.evaluate(() => {
    document.getElementById('fullname').value = 'New Student';
    document.getElementById('email').value = 'jay@campusly.com'; // Duplicate email in users table
    document.getElementById('department').value = 'CSE';
    document.getElementById('password').value = 'Student@123';
    document.getElementById('confirm_password').value = 'Student@123';
    document.getElementById('registration-form').submit();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '05_duplicate_email_validation.png'), fullPage: false });

  // 6. Successful User Registration
  console.log('Capturing 06_successful_user_registration.png...');
  await page.goto('http://127.0.0.1:8000/register.php?nointro=1', { waitUntil: 'networkidle0' });
  await preparePage();
  const testEmail = 'kavya.patel@charusat.edu.in';
  await page.evaluate((email) => {
    document.getElementById('fullname').value = 'Kavya Patel';
    document.getElementById('email').value = email;
    document.getElementById('department').value = 'CSE';
    document.getElementById('password').value = 'Secure@123';
    document.getElementById('confirm_password').value = 'Secure@123';
    document.getElementById('registration-form').submit();
  }, testEmail);
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '06_successful_user_registration.png'), fullPage: false });

  // 7. Database Password Hash Verification
  console.log('Capturing 07_database_password_hash_verification.png...');
  await page.goto('http://127.0.0.1:8000/verify_registration_db.php', { waitUntil: 'networkidle0' });
  await preparePage();
  await page.screenshot({ path: path.join(OUT_DIR, '07_database_password_hash_verification.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
