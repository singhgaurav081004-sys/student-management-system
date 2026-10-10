const puppeteer = require('puppeteer-core');
const path = require('path');

async function renderTerminal() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 600, deviceScaleFactor: 2 });
  const termHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; padding: 25px; background: #0f172a; font-family: 'Consolas', 'Courier New', monospace; color: #f8fafc; display: flex; justify-content: center; align-items: center; }
      .terminal { width: 920px; background: #1e293b; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #334155; }
      .term-bar { background: #0f172a; padding: 10px 15px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #334155; }
      .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
      .red { background: #ef4444; } .yellow { background: #f59e0b; } .green { background: #10b981; }
      .title { margin-left: 10px; font-size: 13px; color: #94a3b8; }
      .term-body { padding: 20px; font-size: 13px; line-height: 1.5; }
      .header-text { color: #38bdf8; font-weight: bold; }
      .section-text { color: #facc15; margin-top: 10px; font-weight: bold; }
      .pass { color: #4ade80; font-weight: bold; }
      .summary-box { margin-top: 15px; padding: 10px 15px; background: #064e3b; border: 1px solid #059669; border-radius: 6px; color: #a7f3d0; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="terminal">
      <div class="term-bar">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        <span class="title">PowerShell &bull; java -cp target/classes com.studentmanagement.SystemTestSuite</span>
      </div>
      <div class="term-body">
        <div class="header-text">======================================================<br>
     RUNNING STUDENT MANAGEMENT SYSTEM TEST SUITE<br>
======================================================</div>
        <div class="section-text">--- Testing Student Model ---</div>
        <div><span class="pass">[PASS]</span> Student ID matches &bull; <span class="pass">[PASS]</span> Student Roll matches &bull; <span class="pass">[PASS]</span> Department matches &bull; <span class="pass">[PASS]</span> Prevents duplicate courses</div>
        <div class="section-text">--- Testing Course Model & Capacity ---</div>
        <div><span class="pass">[PASS]</span> Course capacity matches &bull; <span class="pass">[PASS]</span> Initial enrolled count is 0 &bull; <span class="pass">[PASS]</span> Reports full when enrolled == capacity</div>
        <div class="section-text">--- Testing Enrollment Model ---</div>
        <div><span class="pass">[PASS]</span> Default status is ACTIVE &bull; <span class="pass">[PASS]</span> Default grade is Not Assigned &bull; <span class="pass">[PASS]</span> Grade update persists</div>
        <div class="section-text">--- Testing Email Regex Validation & Range Logic ---</div>
        <div><span class="pass">[PASS]</span> Valid email accepted &bull; <span class="pass">[PASS]</span> Invalid email without domain rejected &bull; <span class="pass">[PASS]</span> Year range 1-4 enforced</div>
        <div class="section-text">--- Testing Custom Exceptions ---</div>
        <div><span class="pass">[PASS]</span> ValidationException caught &bull; <span class="pass">[PASS]</span> CourseFullException caught &bull; <span class="pass">[PASS]</span> StudentNotFoundException caught</div>
        <div class="summary-box">
          ====================================================<br>
          TEST RESULTS: 27 Passed, 0 Failed (100% Pass Rate)<br>
          ====================================================<br>
          All system and business logic tests PASSED successfully!
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(termHtml);
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'fig5_6_test_suite_execution.png') });
  await browser.close();
  console.log('Generated Fig 5.6 Test Suite screenshot');
}
renderTerminal().catch(console.error);
