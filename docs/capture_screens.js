const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const screensDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  console.log('Navigating to live deployment...');
  await page.goto('https://sms-delta-eight.vercel.app', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Dashboard / Home page
  await page.screenshot({ path: path.join(screensDir, 'fig5_1_home_dashboard.png') });
  console.log('Captured 1: Dashboard');

  // 2. Students Tab
  await page.click('#navStudents');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screensDir, 'fig5_2_students_directory.png') });
  console.log('Captured 2: Students Tab');

  // 3. Courses Tab
  await page.click('#navCourses');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screensDir, 'fig5_3_course_catalog.png') });
  console.log('Captured 3: Courses Tab');

  // 4. Enrollments Tab
  await page.click('#navEnrollments');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screensDir, 'fig5_4_enrollments_management.png') });
  console.log('Captured 4: Enrollments Tab');

  // 5. Open Modal
  const editBtn = await page.$('.btn-edit');
  if (editBtn) {
    await editBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screensDir, 'fig5_5_grade_evaluation_modal.png') });
    console.log('Captured 5: Evaluation Modal');
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
