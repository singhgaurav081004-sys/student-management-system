const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function renderDiagrams() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,800']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 600, deviceScaleFactor: 2 });

  const screensDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir, { recursive: true });

  // 1. Fig 3.1: Architecture Diagram
  const archHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; display: flex; justify-content: center; align-items: center; }
      .container { width: 1000px; padding: 25px; border: 2px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); background: #f8fafc; }
      .title { text-align: center; font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 25px; }
      .grid { display: flex; justify-content: space-between; align-items: stretch; gap: 20px; position: relative; }
      .tier { flex: 1; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
      .tier-header { font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 12px; text-align: center; }
      .tier-header.tier2 { border-bottom-color: #10b981; }
      .tier-header.tier3 { border-bottom-color: #8b5cf6; }
      .box { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 13px; color: #334155; }
      .box strong { color: #0f172a; display: block; margin-bottom: 3px; }
      .arrow { display: flex; align-items: center; justify-content: center; font-size: 28px; color: #64748b; font-weight: bold; }
      .subtitle { text-align: center; font-size: 11px; color: #64748b; margin-top: 15px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">Figure 3.1: 3-Tier System Architecture Block Diagram</div>
      <div class="grid">
        <div class="tier">
          <div class="tier-header">1. Presentation Layer</div>
          <div class="box"><strong>Vercel Web Dashboard</strong>Responsive SPA, HTML5, Vanilla CSS3 tokens, Dark/Light Themes</div>
          <div class="box"><strong>Interactive CLI Menu</strong>Terminal UI, ANSI Formatting, Role authentication</div>
          <div class="box"><strong>State Management</strong>LocalStorage client cache & Asynchronous Fetch API</div>
        </div>
        <div class="arrow">&#8644;</div>
        <div class="tier">
          <div class="tier-header tier2">2. Business Logic Layer</div>
          <div class="box"><strong>Java 17 LTS Services</strong>StudentService, CourseService, EnrollmentService</div>
          <div class="box"><strong>Concurrency & Rules</strong>Atomic capacity reservation, duplicate check, grade state validation</div>
          <div class="box"><strong>Custom Exceptions</strong>ValidationException, CourseFullException, StudentNotFoundException</div>
        </div>
        <div class="arrow">&#8644;</div>
        <div class="tier">
          <div class="tier-header tier3">3. Data Persistence Layer</div>
          <div class="box"><strong>MongoDB Atlas (Cloud)</strong>NoSQL Cluster, SSL/TLS, Connection Pooling</div>
          <div class="box"><strong>Document Repositories</strong>StudentRepository, CourseRepository, EnrollmentRepository</div>
          <div class="box"><strong>Consistency Safeguards</strong>$expr conditional checks, Compensating Transactions</div>
        </div>
      </div>
      <div class="subtitle">Student Management System (SMS) &bull; Synchronous & Asynchronous Data Flow</div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(archHtml);
  await page.screenshot({ path: path.join(screensDir, 'fig3_1_architecture_diagram.png') });
  console.log('Generated Fig 3.1 Architecture Diagram');

  // 2. Fig 3.2: Database ER / Document Schema Diagram
  const schemaHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; display: flex; justify-content: center; align-items: center; }
      .container { width: 1000px; padding: 25px; border: 2px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); background: #f8fafc; }
      .title { text-align: center; font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 25px; }
      .grid { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
      .entity { flex: 1; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
      .entity-header { background: #1e293b; color: #ffffff; padding: 10px 14px; font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; }
      .badge { font-size: 11px; background: #3b82f6; padding: 2px 6px; border-radius: 4px; }
      .badge.green { background: #10b981; }
      .badge.purple { background: #8b5cf6; }
      .badge.amber { background: #f59e0b; }
      .attr-list { list-style: none; margin: 0; padding: 8px 14px; }
      .attr { font-size: 12px; color: #334155; padding: 5px 0; border-bottom: 1px dashed #e2e8f0; display: flex; justify-content: space-between; }
      .attr:last-child { border-bottom: none; }
      .attr strong { color: #0f172a; }
      .pk { color: #dc2626; font-size: 10px; font-weight: bold; margin-left: 4px; }
      .fk { color: #2563eb; font-size: 10px; font-weight: bold; margin-left: 4px; }
      .rel-note { text-align: center; font-size: 12px; color: #475569; margin-top: 20px; padding: 10px; background: #e2e8f0; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">Figure 3.2: MongoDB Document Schema & Entity Relationship Model</div>
      <div class="grid">
        <div class="entity">
          <div class="entity-header"><span>students</span> <span class="badge">Collection</span></div>
          <ul class="attr-list">
            <li class="attr"><span><strong>_id</strong> <span class="pk">PK</span></span> <span>String (UUID)</span></li>
            <li class="attr"><span><strong>name</strong></span> <span>String</span></li>
            <li class="attr"><span><strong>email</strong> <span class="pk">UK</span></span> <span>String</span></li>
            <li class="attr"><span><strong>rollNumber</strong> <span class="pk">UK</span></span> <span>String</span></li>
            <li class="attr"><span><strong>department</strong></span> <span>String</span></li>
            <li class="attr"><span><strong>year</strong></span> <span>Integer (1-4)</span></li>
            <li class="attr"><span><strong>enrolledCourseIds</strong></span> <span>Array&lt;String&gt;</span></li>
          </ul>
        </div>
        <div class="entity">
          <div class="entity-header"><span>courses</span> <span class="badge green">Collection</span></div>
          <ul class="attr-list">
            <li class="attr"><span><strong>_id</strong> <span class="pk">PK</span></span> <span>String (Code)</span></li>
            <li class="attr"><span><strong>name</strong></span> <span>String</span></li>
            <li class="attr"><span><strong>instructor</strong></span> <span>String</span></li>
            <li class="attr"><span><strong>credits</strong></span> <span>Integer (1-5)</span></li>
            <li class="attr"><span><strong>capacity</strong></span> <span>Integer</span></li>
            <li class="attr"><span><strong>enrolledCount</strong></span> <span>Integer</span></li>
          </ul>
        </div>
        <div class="entity">
          <div class="entity-header"><span>enrollments</span> <span class="badge purple">Collection</span></div>
          <ul class="attr-list">
            <li class="attr"><span><strong>_id</strong> <span class="pk">PK</span></span> <span>String (UUID)</span></li>
            <li class="attr"><span><strong>studentId</strong> <span class="fk">FK</span></span> <span>String</span></li>
            <li class="attr"><span><strong>courseId</strong> <span class="fk">FK</span></span> <span>String</span></li>
            <li class="attr"><span><strong>enrollmentDate</strong></span> <span>Date (ISO)</span></li>
            <li class="attr"><span><strong>grade</strong></span> <span>String (A-F/NA)</span></li>
            <li class="attr"><span><strong>status</strong></span> <span>Enum(ACTIVE..)</span></li>
          </ul>
        </div>
      </div>
      <div class="rel-note">
        <strong>Relationship Cardinality:</strong> Student (1) &mdash;&mdash;&lt; Enrolls In &gt;&mdash;&mdash;&infin; Enrollment &infin;&mdash;&mdash;&lt; Belongs To &gt;&mdash;&mdash; (1) Course
      </div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(schemaHtml);
  await page.screenshot({ path: path.join(screensDir, 'fig3_2_database_schema.png') });
  console.log('Generated Fig 3.2 Database Schema Diagram');

  await browser.close();
}

renderDiagrams().catch(console.error);
