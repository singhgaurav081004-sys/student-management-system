const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generatePdf() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Convert screenshots to base64 for reliable PDF embedding
  const screensDir = path.join(__dirname, 'screenshots');
  const getImgBase64 = (filename) => {
    const p = path.join(screensDir, filename);
    if (!fs.existsSync(p)) return '';
    return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  };

  const imgFig3_1 = getImgBase64('fig3_1_architecture_diagram.png');
  const imgFig3_2 = getImgBase64('fig3_2_database_schema.png');
  const imgFig5_1 = getImgBase64('fig5_1_home_dashboard.png');
  const imgFig5_2 = getImgBase64('fig5_2_students_directory.png');
  const imgFig5_3 = getImgBase64('fig5_3_course_catalog.png');
  const imgFig5_4 = getImgBase64('fig5_4_enrollments_management.png');
  const imgFig5_5 = getImgBase64('fig5_5_grade_evaluation_modal.png');
  const imgFig5_6 = getImgBase64('fig5_6_test_suite_execution.png');

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Student Management System - Project Report</title>
    <style>
      @page {
        size: A4;
        margin: 24mm 20mm 24mm 20mm;
        @bottom-right {
          content: counter(page);
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
        }
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000000;
        margin: 0;
        padding: 0;
      }
      .page-break {
        page-break-before: always;
      }
      .avoid-break {
        page-break-inside: avoid;
      }
      h1.report-title {
        text-align: center;
        font-size: 20pt;
        font-weight: bold;
        margin-top: 40px;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      h2.report-subtitle {
        text-align: center;
        font-size: 14pt;
        font-weight: bold;
        margin-top: 0;
        margin-bottom: 25px;
        color: #1e293b;
      }
      h3.course-info {
        text-align: center;
        font-size: 13pt;
        font-weight: bold;
        margin-bottom: 40px;
      }
      .center-text {
        text-align: center;
      }
      .justify-text {
        text-align: justify;
      }
      .chapter-title {
        text-align: center;
        font-size: 16pt;
        font-weight: bold;
        margin-top: 15px;
        margin-bottom: 20px;
        text-transform: uppercase;
      }
      .sec-heading {
        font-size: 13pt;
        font-weight: bold;
        margin-top: 18px;
        margin-bottom: 8px;
      }
      p {
        margin-top: 0;
        margin-bottom: 12px;
        text-align: justify;
      }
      ul {
        margin-top: 0;
        margin-bottom: 14px;
        padding-left: 24px;
      }
      li {
        margin-bottom: 6px;
        text-align: justify;
      }
      .code-container {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 12px;
        margin: 14px 0;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 9.5pt;
        line-height: 1.35;
        color: #1e293b;
        white-space: pre-wrap;
        page-break-inside: avoid;
      }
      .figure-box {
        text-align: center;
        margin: 16px 0;
        page-break-inside: avoid;
      }
      .figure-box img {
        max-width: 95%;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }
      .figure-caption {
        font-size: 10.5pt;
        font-weight: bold;
        margin-top: 6px;
        color: #1e293b;
      }
      table.data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        page-break-inside: avoid;
      }
      table.data-table th, table.data-table td {
        border-bottom: 1px solid #e2e8f0;
        padding: 6px 10px;
        font-size: 11pt;
      }
      table.data-table th {
        font-weight: bold;
        border-bottom: 2px solid #000;
      }
      .cert-signatures {
        display: flex;
        justify-content: space-between;
        margin-top: 80px;
        page-break-inside: avoid;
      }
      .sign-box {
        width: 45%;
        font-size: 11.5pt;
      }
    </style>
  </head>
  <body>

    <!-- ================= PAGE 1: COVER PAGE ================= -->
    <div style="min-height: 90vh; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h1 class="report-title">STUDENT MANAGEMENT SYSTEM</h1>
        <h2 class="report-subtitle">ACADEMIC ERP & CLOUD PLATFORM</h2>
        <h3 class="course-info">21CSC203P/ADVANCED PROGRAMMING PRACTICE<br>PROJECT REPORT</h3>
        
        <div class="center-text" style="margin: 40px 0;">
          <p style="font-size: 12pt; margin-bottom: 6px;">Submitted by</p>
          <p style="font-size: 14pt; font-weight: bold; margin-bottom: 0;">GAURAV SINGH &nbsp; RA2511026030018</p>
        </div>

        <div class="center-text" style="margin: 40px 0;">
          <p style="font-size: 12pt; margin-bottom: 4px;">Under the guidance of</p>
          <p style="font-size: 13pt; font-weight: bold; margin-bottom: 4px;">Dr. S. Palanivel</p>
          <p style="font-size: 11.5pt; color: #334155;">(Associate Professor, Department of Computer Science and Engineering)</p>
        </div>
      </div>

      <div class="center-text" style="margin-bottom: 20px;">
        <p style="font-size: 11.5pt; margin-bottom: 4px;">in partial fulfilment for the award of the degree of</p>
        <p style="font-size: 13pt; font-weight: bold; margin-bottom: 4px;">BACHELOR OF TECHNOLOGY</p>
        <p style="font-size: 11.5pt; margin-bottom: 4px;">in</p>
        <p style="font-size: 13pt; font-weight: bold; margin-bottom: 25px;">COMPUTER SCIENCE AND ENGINEERING</p>
        <p style="font-size: 12pt; font-weight: bold; margin-bottom: 4px;">FACULTY OF ENGINEERING AND TECHNOLOGY</p>
        <p style="font-size: 13pt; font-weight: bold; margin-bottom: 0;">SRM INSTITUTE OF SCIENCE & TECHNOLOGY, DELHI-NCR CAMPUS</p>
      </div>
    </div>

    <!-- ================= PAGE 2: BONAFIDE CERTIFICATE ================= -->
    <div class="page-break">
      <div class="center-text" style="margin-bottom: 25px;">
        <h2 style="font-size: 13pt; margin-bottom: 4px;">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY</h2>
        <p style="font-size: 11pt; margin-bottom: 25px;">(Deemed to be University U/S 3 of UGC Act, 1956)</p>
        <h2 style="font-size: 15pt; font-weight: bold;">BONAFIDE CERTIFICATE</h2>
      </div>

      <p class="justify-text" style="font-size: 12pt; line-height: 1.6; margin-top: 35px;">
        Certified that this project report titled <strong>STUDENT MANAGEMENT SYSTEM</strong> is the bonafide work of 
        <strong>GAURAV SINGH (RA2511026030018)</strong> who carried out the project work under my supervision. 
        Certified further, that to the best of my knowledge the work reported herein does not form any other project 
        report or dissertation on the basis of which a degree or award was conferred on an occasion on this or any other candidate.
      </p>

      <div class="cert-signatures">
        <div class="sign-box">
          <p><strong>SIGNATURE</strong></p>
          <div style="height: 50px;"></div>
          <p><strong>Dr. S. Palanivel</strong><br>
          Associate Professor<br>
          Computer Science & Engineering,<br>
          SRM Institute of Science and Technology,<br>
          Delhi-NCR</p>
        </div>
        <div class="sign-box" style="text-align: right;">
          <p><strong>SIGNATURE</strong></p>
          <div style="height: 50px;"></div>
          <p><strong>Dr. Harish Taluja</strong><br>
          Head of the Department<br>
          Computer Science & Engineering,<br>
          SRM Institute of Science and Technology,<br>
          Delhi-NCR</p>
        </div>
      </div>

      <div style="margin-top: 80px;">
        <p>Submitted for the project viva-voce held on ____________________ at SRM Institute of Science and Technology, Delhi-NCR.</p>
      </div>
    </div>

    <!-- ================= PAGE 3: DECLARATION ================= -->
    <div class="page-break">
      <div class="center-text" style="margin-bottom: 40px;">
        <h2 style="font-size: 15pt; font-weight: bold;">DECLARATION</h2>
      </div>

      <p class="justify-text" style="font-size: 12pt; line-height: 1.6;">
        I hereby declare that the entire work contained in this project report titled <strong>STUDENT MANAGEMENT SYSTEM</strong> 
        has been carried out by <strong>GAURAV SINGH (RA2511026030018)</strong> at SRM Institute of Science and Technology, 
        Delhi-NCR, under the guidance of <strong>Dr. S. Palanivel</strong>, Associate Professor, Department of Computer Science and Engineering.
      </p>

      <div style="margin-top: 140px; text-align: right;">
        <p style="font-weight: bold; line-height: 1.5;">
          GAURAV SINGH (RA2511026030018)<br>
          Department of Computer Science & Engineering<br>
          SRM Institute of Science and Technology, Delhi-NCR
        </p>
      </div>
    </div>

    <!-- ================= PAGE 4: ABSTRACT ================= -->
    <div class="page-break">
      <div class="center-text" style="margin-bottom: 25px;">
        <h2 style="font-size: 15pt; font-weight: bold;">ABSTRACT</h2>
      </div>

      <p>
        In modern higher education institutions, managing voluminous student records, dynamic course offerings, department allocations, seat capacity limits, and multi-tier grade evaluations presents severe administrative and concurrency challenges. Traditional manual or spreadsheet-based tracking methods suffer from severe race conditions during high-volume course registration windows, lack of transactional consistency, poor data security, and absence of real-time analytical visibility for department heads and administrators.
      </p>
      <p>
        This project presents an enterprise-patterned, full-stack <strong>Student Management System (SMS)</strong> built on a modular 3-tier architecture. The system integrates <strong>Java 17 LTS</strong>, <strong>MongoDB Atlas cloud database</strong>, Maven build automation, and a responsive web dashboard deployed globally on <strong>Vercel (https://sms-delta-eight.vercel.app)</strong>. The backend implements robust business service validation, custom exception boundaries, and atomic database queries to guarantee ACID consistency during concurrent operations.
      </p>
      <p>
        Key capabilities include complete student profile lifecycle management (CRUD, unique roll-number validation, department and year tracking), course catalog administration with credit limits and atomic capacity tracking, and student self-service enrollment with instantaneous prerequisite and seat validation. Concurrency safety is achieved in MongoDB through atomic <code>$expr</code> conditional updates preventing over-enrollment, backed by compensating rollback transactions.
      </p>
      <p>
        The frontend provides a polished dark-mode interface featuring real-time stat cards, dynamic search and filtering, modal grade evaluation dialogs, and instant persistence. A comprehensive automated test suite of 27 test cases verifies 100% functionality across models, validation rules, and custom exception handlers, ensuring an error-resilient platform ready for academic adoption.
      </p>
    </div>

    <!-- ================= PAGE 5: TABLE OF CONTENTS ================= -->
    <div class="page-break">
      <div class="center-text" style="margin-bottom: 20px;">
        <h2 style="font-size: 15pt; font-weight: bold;">TABLE OF CONTENTS</h2>
      </div>

      <table class="data-table">
        <tr><th>Topic</th><th style="text-align: right; width: 80px;">Page No</th></tr>
        <tr><td><strong>ABSTRACT</strong></td><td style="text-align: right;"><strong>1</strong></td></tr>
        <tr><td><strong>Table of Contents</strong></td><td style="text-align: right;"><strong>2-3</strong></td></tr>
        <tr><td><strong>List of Figures</strong></td><td style="text-align: right;"><strong>4</strong></td></tr>
        <tr><td><strong>Chapter 01: Introduction</strong></td><td style="text-align: right;"><strong>5-9</strong></td></tr>
        <tr><td style="padding-left: 20px;">1.1 Background of the Problem</td><td style="text-align: right;">5</td></tr>
        <tr><td style="padding-left: 20px;">1.2 Problem Statement</td><td style="text-align: right;">6-7</td></tr>
        <tr><td style="padding-left: 20px;">1.3 Project Objectives</td><td style="text-align: right;">8</td></tr>
        <tr><td style="padding-left: 20px;">1.4 Scope and Motivation</td><td style="text-align: right;">9</td></tr>
        <tr><td><strong>Chapter 02: Existing Systems and Technologies</strong></td><td style="text-align: right;"><strong>10-11</strong></td></tr>
        <tr><td style="padding-left: 20px;">2.1 Overview of Current Student Management Tools</td><td style="text-align: right;">10</td></tr>
        <tr><td style="padding-left: 20px;">2.2 Limitations of Existing Solutions</td><td style="text-align: right;">11</td></tr>
        <tr><td><strong>Chapter 03: System Design and Methodology</strong></td><td style="text-align: right;"><strong>12-18</strong></td></tr>
        <tr><td style="padding-left: 20px;">3.1 Architecture Overview (Block Diagrams)</td><td style="text-align: right;">12-13</td></tr>
        <tr><td style="padding-left: 20px;">3.2 Database Design (MongoDB Document Schema & ER)</td><td style="text-align: right;">14-15</td></tr>
        <tr><td style="padding-left: 20px;">3.3 Technology Stack Description</td><td style="text-align: right;">15-16</td></tr>
        <tr><td style="padding-left: 20px;">3.4 Proposed Methodology and Workflow</td><td style="text-align: right;">16-18</td></tr>
        <tr><td><strong>Chapter 04: Implementation</strong></td><td style="text-align: right;"><strong>19-25</strong></td></tr>
        <tr><td style="padding-left: 20px;">4.1 Backend Development (Java 17, Service Layer, Exceptions)</td><td style="text-align: right;">19-21</td></tr>
        <tr><td style="padding-left: 20px;">4.2 Data Persistence & MongoDB Atlas Integration</td><td style="text-align: right;">22-24</td></tr>
        <tr><td style="padding-left: 20px;">4.3 Frontend & Web Server Development (Vercel & HTTP Server)</td><td style="text-align: right;">24-25</td></tr>
        <tr><td><strong>Chapter 05: Results</strong></td><td style="text-align: right;"><strong>26-29</strong></td></tr>
        <tr><td style="padding-left: 20px;">5.0 Overview of System Deployment</td><td style="text-align: right;">26</td></tr>
        <tr><td style="padding-left: 20px;">5.1 Home Page & Analytics Dashboard</td><td style="text-align: right;">26</td></tr>
        <tr><td style="padding-left: 20px;">5.2 Student Directory & Lifecycle Management</td><td style="text-align: right;">27</td></tr>
        <tr><td style="padding-left: 20px;">5.3 Course Catalog & Seat Occupancy</td><td style="text-align: right;">27</td></tr>
        <tr><td style="padding-left: 20px;">5.4 Course Enrollment & Real-Time Grading</td><td style="text-align: right;">28</td></tr>
        <tr><td style="padding-left: 20px;">5.5 Evaluation & Status Update Modal</td><td style="text-align: right;">28</td></tr>
        <tr><td style="padding-left: 20px;">5.6 Automated Test Suite Execution & Verification</td><td style="text-align: right;">29</td></tr>
        <tr><td><strong>Chapter 06: Challenges and Solutions</strong></td><td style="text-align: right;"><strong>30-32</strong></td></tr>
        <tr><td style="padding-left: 20px;">6.1 Technical Challenges Faced</td><td style="text-align: right;">30-31</td></tr>
        <tr><td style="padding-left: 20px;">6.2 Solution Approaches</td><td style="text-align: right;">31-32</td></tr>
        <tr><td><strong>Chapter 07: Conclusion and Future Work</strong></td><td style="text-align: right;"><strong>33-35</strong></td></tr>
        <tr><td style="padding-left: 20px;">7.1 Summary of Achievements</td><td style="text-align: right;">33</td></tr>
        <tr><td style="padding-left: 20px;">7.2 Potential Enhancements</td><td style="text-align: right;">34</td></tr>
        <tr><td style="padding-left: 20px;">7.3 Final Thoughts</td><td style="text-align: right;">35</td></tr>
        <tr><td><strong>Chapter 08: References</strong></td><td style="text-align: right;"><strong>36</strong></td></tr>
      </table>
    </div>

    <!-- ================= PAGE 6: LIST OF FIGURES ================= -->
    <div class="page-break">
      <div class="center-text" style="margin-bottom: 25px;">
        <h2 style="font-size: 15pt; font-weight: bold;">LIST OF FIGURES</h2>
      </div>

      <table class="data-table">
        <tr><th>Fig No</th><th>Figure Name</th><th style="text-align: right; width: 80px;">Page No</th></tr>
        <tr><td>Fig 3.1</td><td>3-Tier System Architecture Block Diagram</td><td style="text-align: right;">13</td></tr>
        <tr><td>Fig 3.2</td><td>MongoDB Document Schema & Entity Relationship Model</td><td style="text-align: right;">15</td></tr>
        <tr><td>Fig 5.1</td><td>Home Page & Real-Time Academic KPI Dashboard (Live on Vercel)</td><td style="text-align: right;">26</td></tr>
        <tr><td>Fig 5.2</td><td>Student Directory with Dynamic Search & Department Filtering</td><td style="text-align: right;">27</td></tr>
        <tr><td>Fig 5.3</td><td>Course Catalog Interface with Seat Capacity Meters</td><td style="text-align: right;">27</td></tr>
        <tr><td>Fig 5.4</td><td>Enrollment Oversight Table with Live Grade Status</td><td style="text-align: right;">28</td></tr>
        <tr><td>Fig 5.5</td><td>Interactive Grade Evaluation & Academic Status Modal Dialog</td><td style="text-align: right;">28</td></tr>
        <tr><td>Fig 5.6</td><td>Automated System Test Suite Execution Terminal (27/27 Tests Passed)</td><td style="text-align: right;">29</td></tr>
      </table>
    </div>

    <!-- ================= CHAPTER 01: INTRODUCTION ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 01<br>INTRODUCTION</div>
      <div class="sec-heading">1.1 Background of the Problem</div>
      <p>Higher education institutions are dynamic ecosystems that manage the academic progression of thousands of students across dozens of disciplines. Over the past decade, rapid growth in university enrollments, modular interdisciplinary curriculum structures, and increasing compliance mandates have transformed academic administration into a data-intensive operation.</p>
      <p>At the center of academic operations lies the student lifecycle: admitting new students, tracking departmental affiliations, maintaining course offerings, enforcing prerequisite and credit caps, processing course enrollments, and evaluating final grades. Historically, academic institutions relied on manual paperwork or distributed spreadsheets (such as Microsoft Excel or Google Sheets) maintained independently by disparate department offices.</p>
      <p>However, spreadsheet-driven systems break down rapidly under modern institutional demands. Multiple staff members modifying isolated copies of files lead to data silos, version skew, and missing records. Most critically, during peak course registration windows, simultaneous attempts to enroll in limited-capacity courses result in race conditions, overselling seats, and severe operational confusion. The transition toward centralized, cloud-enabled Student Management Systems (SMS) is essential to preserve institutional integrity and operational clarity.</p>

      <div class="sec-heading">1.2 Problem Statement</div>
      <p>Academic institutions face profound operational bottlenecks and risks when using legacy, decentralized management approaches. Critical problems identified include:</p>
      <ul>
        <li><strong>Concurrency and Race Conditions:</strong> During peak enrollment periods, simultaneous registration attempts by students for popular courses result in over-enrollment beyond classroom seating limits when systems lack atomic capacity verification.</li>
        <li><strong>Data Inconsistency and Fragmentation:</strong> Isolated records across department spreadsheets result in mismatched roll numbers, duplicate student records, untracked course changes, and erroneous academic transcripts.</li>
        <li><strong>Absence of Instant Analytical Visibility:</strong> University deans and department heads lack unified dashboards to monitor enrollment trends, track department-wise cohort distributions, or identify under-subscribed courses in real time.</li>
        <li><strong>Lack of Accessibility and Cloud Resilience:</strong> Legacy desktop-only database applications fail to provide secure, cross-device web accessibility for administrators and students, preventing flexible remote management.</li>
      </ul>
      <p>Consequently, there is an urgent need for an automated, scalable, and resilient Student Management System that pairs a strict enterprise backend with a modern, high-performance web dashboard accessible from any browser.</p>

      <div class="sec-heading">1.3 Project Objectives</div>
      <p>The primary objectives of this Student Management System project are:</p>
      <ul>
        <li><strong>Architect a Modular 3-Tier Enterprise Application:</strong> Enforce strict separation of concerns across a presentation layer, a Java 17 business logic service layer, and a cloud NoSQL data persistence layer.</li>
        <li><strong>Cloud Data Persistence with MongoDB Atlas:</strong> Establish secure, scalable document storage for students, courses, enrollments, and administrators with connection pooling and SSL encryption.</li>
        <li><strong>Enforce Atomic Concurrency Controls:</strong> Implement conditional atomic updates (<code>$expr</code> with <code>$lt</code> constraints) to ensure course seat capacity thresholds are never exceeded under concurrent registration demands.</li>
        <li><strong>Develop Comprehensive Business Validation:</strong> Provide rigorous validation for student roll numbers, email regex patterns, academic year ranges (1-4), course credit units, and valid grade codes.</li>
        <li><strong>Deliver a High-Performance Responsive Web Dashboard:</strong> Build and deploy an interactive dark-mode web application on Vercel with real-time stat cards, dynamic search, and seamless enrollment workflows.</li>
        <li><strong>Automate Quality Verification:</strong> Implement an automated test suite to rigorously validate all business models, validation rules, capacity edge cases, and custom exceptions.</li>
      </ul>

      <div class="sec-heading">1.4 Scope and Motivation</div>
      <p><strong>Scope:</strong></p>
      <p>This project delivers a complete academic ERP management solution including:</p>
      <ul>
        <li><strong>Student Lifecycle Management:</strong> Adding students with unique roll numbers and emails, updating academic profiles, filtering by department, and viewing enrolled courses.</li>
        <li><strong>Course Catalog Administration:</strong> Registering courses with credit allocations, assigned instructors, and strict seat quotas; querying most-enrolled courses.</li>
        <li><strong>Transactional Enrollment Engine:</strong> Enrolling students into courses with atomic capacity checks, duplicate registration prevention, and compensating rollback transactions.</li>
        <li><strong>Grade & Evaluation Processing:</strong> Administering letter grades (A, B, C, D, F) and updating status lifecycles (ACTIVE, COMPLETED, DROPPED).</li>
        <li><strong>Cloud Production Deployment:</strong> Hosting the web application globally on Vercel (https://sms-delta-eight.vercel.app) with persistent client storage and zero infrastructure overhead.</li>
      </ul>
      <p><strong>Motivation:</strong></p>
      <p>The motivation behind this project stems from the critical need in academic institutions for reliable, real-time, and user-friendly software that eliminates administrative errors and empowers students and faculty with instantaneous visibility into their academic standing.</p>
    </div>

    <!-- ================= CHAPTER 02: EXISTING SYSTEMS ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 02<br>EXISTING SYSTEMS AND TECHNOLOGIES</div>
      <div class="sec-heading">2.1 Overview of Current Student Management Tools</div>
      <p>A variety of approaches and commercial solutions are presently utilized within academic environments to manage student information and enrollments:</p>
      <ul>
        <li><strong>1. Manual Spreadsheets and Legacy Flat-File Systems:</strong> Smaller colleges often rely on Microsoft Excel or Google Sheets. While accessible and easy to deploy initially, they lack database constraints, ACID transaction guarantees, role-based authorization, and concurrent write safety.</li>
        <li><strong>2. Enterprise Resource Planning (ERP) Platforms:</strong> Commercial university ERP suites such as Banner by Ellucian, PeopleSoft Campus Solutions, and SAP Student Lifecycle Management provide comprehensive feature sets. However, they are prohibitively expensive, require multi-year implementations, and impose complex, dated user interfaces.</li>
        <li><strong>3. Open-Source Academic Management Tools:</strong> Open-source platforms like OpenSIS or Fedena provide web-based school administration. Nonetheless, many depend on traditional relational schemas that struggle with dynamic document structures or lack optimized client-side interactivity.</li>
        <li><strong>4. In-House Bespoke Systems:</strong> Custom systems built by campus IT teams frequently suffer from architectural drift, inadequate concurrency handling during add/drop registration weeks, and tightly coupled codebases that complicate updates.</li>
      </ul>

      <div class="sec-heading">2.2 Limitations of Existing Solutions</div>
      <p>Despite the availability of existing tools, notable shortcomings persist across current academic implementations:</p>
      <ul>
        <li><strong>1. Susceptibility to Concurrency Race Conditions:</strong> Relational locks in legacy systems often trigger deadlocks or allow seat over-subscription when hundreds of students concurrently register for high-demand elective courses.</li>
        <li><strong>2. Prohibitive Capital & Operational Costs:</strong> Commercial ERP solutions require six-figure licensing fees, expensive database administrators, and complex on-premises server infrastructure.</li>
        <li><strong>3. Rigid Data Models:</strong> Relational SQL schemas require cumbersome schema migration scripts whenever new academic fields, elective categories, or evaluation metrics are introduced.</li>
        <li><strong>4. Poor User Experience & Mobile Incompatibility:</strong> Older institutional portals feature cluttered, non-responsive interfaces that confuse students and administrators, lacking real-time client-side search and modern aesthetics.</li>
        <li><strong>5. Lack of Resilient Cloud Deployment:</strong> On-premises servers frequently crash during peak result publication or course registration windows due to unoptimized architectures lacking edge-cloud distribution.</li>
      </ul>
    </div>

    <!-- ================= CHAPTER 03: SYSTEM DESIGN ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 03<br>SYSTEM DESIGN AND METHODOLOGY</div>
      <div class="sec-heading">3.1 Architecture Overview (Block Diagrams Explained)</div>
      <p>The Student Management System is engineered using an enterprise 3-tier architectural model that ensures strict decoupling, maintainability, and scalability:</p>
      <ul>
        <li><strong>1. Presentation Layer (Client Browser & CLI):</strong> Provides dual interfaces for system interaction. The primary interface is a responsive, dark-mode Single Page Application (SPA) deployed globally on Vercel. It interacts seamlessly with backend endpoints using the asynchronous Fetch API and manages client-side caching. An interactive ANSI-styled console interface (Main.java) provides direct command-line administration.</li>
        <li><strong>2. Business Logic Layer (Java 17 LTS Services):</strong> Encapsulates all domain workflows and business rules within dedicated services: StudentService, CourseService, and EnrollmentService. This layer validates student parameters, verifies course prerequisites, coordinates atomic seat increments, handles compensating transactions, and enforces custom exception boundaries.</li>
        <li><strong>3. Data Persistence Layer (MongoDB Atlas NoSQL Cloud):</strong> Houses document collections (students, courses, enrollments, admins) hosted in a high-availability MongoDB Atlas cluster. Repositories map BSON documents to strongly typed Java domain models and execute high-speed atomic update operations.</li>
      </ul>

      <div class="figure-box">
        <img src="${imgFig3_1}" alt="Architecture Diagram">
        <div class="figure-caption">Figure 3.1: 3-Tier System Architecture Block Diagram</div>
      </div>

      <div class="sec-heading">3.2 Database Design (MongoDB Document Schema & ER)</div>
      <p>The database is structured around flexible NoSQL document schemas that optimize read performance and atomic update operations without requiring multi-table SQL joins:</p>
      <ul>
        <li><strong>students Collection:</strong> Stores student profiles with unique roll numbers and emails, department names, academic year integers, and an embedded array of enrolled course IDs.</li>
        <li><strong>courses Collection:</strong> Maintains course offerings including unique course code IDs, titles, instructor names, credit hours, total seat capacity, and current enrolled student count.</li>
        <li><strong>enrollments Collection:</strong> Captures the transactional association between students and courses, storing ISO timestamps, current letter grades (A-F, Not Assigned), and lifecycle statuses (ACTIVE, COMPLETED, DROPPED).</li>
      </ul>

      <div class="figure-box">
        <img src="${imgFig3_2}" alt="Database Schema">
        <div class="figure-caption">Figure 3.2: MongoDB Document Schema & Entity Relationship Model</div>
      </div>

      <div class="sec-heading">3.3 Technology Stack Description</div>
      <ul>
        <li><strong>Programming Language:</strong> Java 17 LTS & modern ECMAScript (JavaScript ES6+).</li>
        <li><strong>Build Automation & Dependency Management:</strong> Apache Maven 3.9+ managing MongoDB Java Driver, SLF4J, and JUnit dependencies.</li>
        <li><strong>Database Engine:</strong> MongoDB Atlas Cloud NoSQL Database (version 7.0+), providing automated sharding, replication, and wire-level TLS encryption.</li>
        <li><strong>Embedded Web Server:</strong> Java <code>com.sun.net.httpserver.HttpServer</code> serving dynamic RESTful JSON endpoints and static assets without requiring heavy external servlet containers.</li>
        <li><strong>Frontend UI & Styling:</strong> Semantic HTML5, Vanilla CSS3 utilizing modular CSS Custom Properties (Design Tokens), responsive CSS Grid, and Flexbox.</li>
        <li><strong>Cloud Hosting & Edge Distribution:</strong> Vercel Cloud Platform providing global CDN caching, automated SSL certificates, and zero-maintenance continuous deployment.</li>
      </ul>

      <div class="sec-heading">3.4 Proposed Methodology and Workflow</div>
      <p>The development and execution workflow followed an iterative engineering approach comprising five structured phases:</p>
      <ul>
        <li><strong>Phase 1 - Domain Modeling & Schema Specification:</strong> Defined core domain entities (User, Admin, Student, Course, Enrollment) and designed MongoDB document schemas with unique indexes.</li>
        <li><strong>Phase 2 - Repository & Atomic Persistence Layer:</strong> Implemented repository classes with the MongoDB Java driver, incorporating conditional query filters to guarantee thread-safe seat capacity updates.</li>
        <li><strong>Phase 3 - Business Logic & Validation Engine:</strong> Built service classes with strict parameter sanitization, regex email validation, academic year constraints, and custom exception hierarchies.</li>
        <li><strong>Phase 4 - Web Application & Global Deployment:</strong> Developed a responsive web management interface and deployed the production package to Vercel with localized state persistence.</li>
        <li><strong>Phase 5 - Automated Testing & Verification:</strong> Authored a 27-test verification suite and interactive CLI menu to thoroughly test edge cases, capacity overflow, and error handling.</li>
      </ul>
    </div>

    <!-- ================= CHAPTER 04: IMPLEMENTATION ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 04<br>IMPLEMENTATION</div>
      <div class="sec-heading">4.1 Backend Development (Java 17, Service Layer, Exceptions)</div>
      <p>The backend business logic is implemented in Java 17 LTS following enterprise domain-driven design principles. The service layer orchestrates workflows between the repositories and presentation controllers while enforcing business rules.</p>
      <p>A central innovation is the transactional enrollment mechanism within <code>EnrollmentService.java</code>. It enforces active registration checks, validates remaining course capacity, performs atomic incrementation, and executes compensating rollback transactions if persistence errors occur:</p>

      <div class="code-container">// Snippet: EnrollmentService.java - Transactional Enrollment Logic
public Enrollment enroll(String studentId, String courseId) {
    Student student = studentService.getById(studentId);
    Course course = courseService.getCourse(courseId);

    // 1. Verify duplicate active registration
    if (enrollmentRepository.findByStudentAndCourse(studentId, courseId) != null) {
        throw new ValidationException("Student is already actively enrolled in course: " + courseId);
    }

    // 2. Initial capacity verification
    if (!course.hasCapacity()) {
        throw new CourseFullException("Course '" + course.getName() + "' is full (" +
                course.getEnrolledCount() + "/" + course.getCapacity() + " seats taken).");
    }

    // 3. Atomically increment enrollment count with conditional constraint
    if (!courseService.incrementEnrollment(courseId)) {
        throw new CourseFullException("Course capacity was reached. Please choose another course.");
    }

    try {
        Enrollment enrollment = new Enrollment(
                UUID.randomUUID().toString(), studentId, courseId,
                LocalDate.now(), "Not Assigned", "ACTIVE");
        enrollmentRepository.create(enrollment);
        studentService.addCourse(student.getId(), courseId);
        return enrollment;
    } catch (RuntimeException ex) {
        // Compensating transaction: roll back count increment upon failure
        courseService.decrementEnrollment(courseId);
        throw ex;
    }
}</div>

      <div class="sec-heading">4.2 Data Persistence & MongoDB Atlas Integration</div>
      <p>Data access is abstracted through dedicated repository classes using the official MongoDB Java Synchronous Driver. To prevent race conditions during high-concurrency registration, <code>CourseRepository.java</code> executes atomic conditional updates utilizing the <code>$expr</code> operator:</p>

      <div class="code-container">// Snippet: CourseRepository.java - Atomic Conditional Capacity Increment
public boolean incrementEnrollment(String courseId) {
    return courseCollection.updateOne(
            Filters.and(
                    Filters.eq("_id", courseId),
                    new Document("$expr", new Document("$lt", List.of("$enrolledCount", "$capacity")))
            ),
            new Document("$inc", new Document("enrolledCount", 1))
    ).getModifiedCount() > 0;
}

public boolean decrementEnrollment(String courseId) {
    return courseCollection.updateOne(
            Filters.and(
                    Filters.eq("_id", courseId),
                    Filters.gt("enrolledCount", 0)
            ),
            new Document("$inc", new Document("enrolledCount", -1))
    ).getModifiedCount() > 0;
}</div>

      <div class="sec-heading">4.3 Frontend & Web Server Development (Vercel & HTTP Server)</div>
      <p>The web management interface is built with modern Vanilla JavaScript and CSS3 design tokens, avoiding bulky frontend framework dependencies. The client application manages state via localStorage for instant edge loading and seamlessly interfaces with the Java WebServer REST endpoints:</p>

      <div class="code-container">// Snippet: app.js - Client-Side State Management & Evaluation Logic
function updateGrade(event) {
    event.preventDefault();
    const id = document.getElementById('enrollmentId').value;
    const grade = document.getElementById('gradeSelect').value;
    const status = document.getElementById('statusSelect').value;

    const enrollments = JSON.parse(localStorage.getItem('sms_enrollments') || '[]');
    const target = enrollments.find(e => e.id === id);
    if (target) {
        target.grade = grade;
        target.status = status;
        localStorage.setItem('sms_enrollments', JSON.stringify(enrollments));
        showToast('Evaluation updated successfully!', 'success');
        closeGradeModal();
        renderEnrollments();
    }
}</div>
    </div>

    <!-- ================= CHAPTER 05: RESULTS ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 05<br>RESULTS</div>
      <div class="sec-heading">5.0 Overview of System Deployment</div>
      <p>The Student Management System has been fully compiled, tested, and deployed to global cloud production on Vercel at the official URL: <strong>https://sms-delta-eight.vercel.app</strong>. Below are the verified output screens documenting each major system functional module.</p>

      <div class="sec-heading">5.1 Home Page & Analytics Dashboard</div>
      <p>The production Home Dashboard provides academic leadership with an immediate visual overview of institutional health, displaying real-time stat cards for total registered students, active courses, enrollment totals, and average course seat utilization.</p>
      <div class="figure-box">
        <img src="${imgFig5_1}" alt="Dashboard">
        <div class="figure-caption">Figure 5.1: Home Page & Real-Time Academic KPI Dashboard (Live on Vercel)</div>
      </div>

      <div class="sec-heading">5.2 Student Directory & Lifecycle Management</div>
      <p>The Student Management interface allows administrators to search student records by name or roll number, filter cohorts by academic department (Computer Science, Electrical, Mechanical), and register new students.</p>
      <div class="figure-box">
        <img src="${imgFig5_2}" alt="Students">
        <div class="figure-caption">Figure 5.2: Student Directory with Dynamic Search & Department Filtering</div>
      </div>

      <div class="sec-heading">5.3 Course Catalog & Seat Occupancy</div>
      <p>The Course Catalog displays active curriculum offerings with assigned instructors, credit units, and live seat occupancy meters, preventing manual scheduling conflicts.</p>
      <div class="figure-box">
        <img src="${imgFig5_3}" alt="Courses">
        <div class="figure-caption">Figure 5.3: Course Catalog Interface with Seat Capacity Meters</div>
      </div>

      <div class="sec-heading">5.4 Course Enrollment & Real-Time Grading</div>
      <p>The Enrollment Oversight module lists student enrollments with direct actions for updating academic grades and modifying registration statuses.</p>
      <div class="figure-box">
        <img src="${imgFig5_4}" alt="Enrollments">
        <div class="figure-caption">Figure 5.4: Enrollment Oversight Table with Live Grade Status</div>
      </div>

      <div class="sec-heading">5.5 Evaluation & Status Update Modal</div>
      <p>A responsive modal dialog allows instructors and administrators to evaluate student performance, assign standard letter grades (A, B, C, D, F), and transition enrollment statuses (ACTIVE, COMPLETED, DROPPED).</p>
      <div class="figure-box">
        <img src="${imgFig5_5}" alt="Evaluation Modal">
        <div class="figure-caption">Figure 5.5: Interactive Grade Evaluation & Academic Status Modal Dialog</div>
      </div>

      <div class="sec-heading">5.6 Automated Test Suite Execution & Verification</div>
      <p>The automated system test suite verifies all domain entities, validation logic, capacity bounds, and custom exception handling. All 27 automated tests executed with a 100% success rate.</p>
      <div class="figure-box">
        <img src="${imgFig5_6}" alt="Test Suite">
        <div class="figure-caption">Figure 5.6: Automated System Test Suite Execution Terminal (27/27 Tests Passed)</div>
      </div>
    </div>

    <!-- ================= CHAPTER 06: CHALLENGES & SOLUTIONS ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 06<br>CHALLENGES AND SOLUTIONS</div>
      <div class="sec-heading">6.1 Technical Challenges Faced</div>
      <ul>
        <li><strong>1. Concurrency Race Conditions on Course Capacity:</strong> During simulated concurrent enrollment requests, standard read-then-write database operations allowed seat counts to exceed maximum limits.</li>
        <li><strong>2. Asynchronous MongoDB Atlas Handshake Delays:</strong> Cold-start connection handshakes with remote MongoDB Atlas clusters over TLS caused minor latency spikes during initial server bootstrap.</li>
        <li><strong>3. Cross-Platform Cloud Deployment Constraints:</strong> Hosting a Java backend on serverless static edge platforms like Vercel required decoupling static client presentation from backend persistence.</li>
        <li><strong>4. Data Validation and Error Isolation:</strong> Ensuring malformed user inputs (e.g. invalid emails, negative capacity, out-of-range academic years) were intercepted before reaching database collections.</li>
      </ul>

      <div class="sec-heading">6.2 Solution Approaches</div>
      <ul>
        <li><strong>1. MongoDB Atomic Conditional Updates ($expr):</strong> Solved race conditions by shifting capacity verification directly into MongoDB's atomic execution engine using <code>$expr: {$lt: ['$enrolledCount', '$capacity']}</code>.</li>
        <li><strong>2. Compensating Rollback Transactions:</strong> Implemented a compensating transaction in EnrollmentService that automatically decrements course capacity if an enrollment persistence error occurs.</li>
        <li><strong>3. Dual-Mode Presentation & LocalStorage State Bridge:</strong> Engineered a dual-mode client architecture with localStorage client persistence on Vercel and RESTful HTTP syncing when connected to the local Java server.</li>
        <li><strong>4. Comprehensive Custom Exception Hierarchy:</strong> Created distinct domain exceptions (ValidationException, CourseFullException, StudentNotFoundException) mapped to clear user toast alerts.</li>
      </ul>
    </div>

    <!-- ================= CHAPTER 07: CONCLUSION ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 07<br>CONCLUSION AND FUTURE WORK</div>
      <div class="sec-heading">7.1 Summary of Achievements</div>
      <p>The Student Management System successfully demonstrates a robust, modern academic platform built using enterprise architectural patterns. Key milestones achieved include:</p>
      <ul>
        <li><strong>Full-Stack Enterprise Architecture:</strong> Clean decoupling of Presentation, Business Logic, and Data Persistence layers.</li>
        <li><strong>Thread-Safe Capacity Enforcement:</strong> Zero over-enrollments guaranteed via atomic MongoDB updates.</li>
        <li><strong>Global Production Cloud Deployment:</strong> Live, accessible web application on Vercel at https://sms-delta-eight.vercel.app.</li>
        <li><strong>Comprehensive Verification:</strong> 100% automated test pass rate across 27 business rule test cases.</li>
      </ul>

      <div class="sec-heading">7.2 Potential Enhancements</div>
      <ul>
        <li><strong>1. Role-Based Access Control (RBAC):</strong> Integration of JWT-based authentication with differentiated permission views for students, instructors, and deans.</li>
        <li><strong>2. Automated PDF Transcript Generation:</strong> Adding server-side PDF generation to produce official grade sheets and semester transcripts on demand.</li>
        <li><strong>3. Real-Time WebSocket Notifications:</strong> Push notifications for students when waitlisted course seats become available.</li>
      </ul>

      <div class="sec-heading">7.3 Final Thoughts</div>
      <p>This project demonstrates that combining modern cloud databases (MongoDB Atlas) with robust enterprise runtimes (Java 17) and edge-deployed web frontends (Vercel) yields an academic management platform that is significantly more dependable, responsive, and cost-effective than legacy institutional ERP systems.</p>
    </div>

    <!-- ================= CHAPTER 08: REFERENCES ================= -->
    <div class="page-break">
      <div class="chapter-title">CHAPTER 08<br>REFERENCES</div>
      <p>1. Oracle Corporation. (2023). Java Platform, Standard Edition Documentation (Version 17 LTS). Available at https://docs.oracle.com/en/java/javase/17/</p>
      <p>2. MongoDB Inc. (2023). MongoDB Atlas Cloud Database Manual and MongoDB Java Driver Documentation. Available at https://www.mongodb.com/docs/</p>
      <p>3. Apache Software Foundation. (2023). Apache Maven Project Management and Build Automation. Available at https://maven.apache.org/</p>
      <p>4. Vercel Inc. (2024). Vercel Cloud Platform Documentation and Edge Network Deployment. Available at https://vercel.com/docs/</p>
      <p>5. World Wide Web Consortium (W3C). (2023). HTML5 & CSS3 Specification Standards. Available at https://www.w3.org/standards/</p>
      <p>6. Bloch, J. (2018). Effective Java (3rd ed.). Addison-Wesley Professional.</p>
      <p>7. Fowler, M. (2002). Patterns of Enterprise Application Architecture. Addison-Wesley.</p>
      <p>8. Singh, G. (2026). Student Management System (SMS) Source Repository [GitHub]. Available at https://github.com/singhgaurav081004-sys/student-management-system</p>
      <p>9. Singh, G. (2026). Student Management System Live Production Web Application [Vercel]. Available at https://sms-delta-eight.vercel.app</p>
    </div>

  </body>
  </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // Save HTML version as well
  fs.writeFileSync(path.join(__dirname, 'STUDENT_MANAGEMENT_SYSTEM_PROJECT_REPORT.html'), htmlContent, 'utf8');

  // Generate PDF
  const outPdf = path.join(__dirname, 'STUDENT_MANAGEMENT_SYSTEM_PROJECT_REPORT.pdf');
  await page.pdf({
    path: outPdf,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '20mm',
      right: '20mm'
    }
  });

  await browser.close();
  console.log('Report PDF and HTML generated successfully at:', outPdf);
}

generatePdf().catch(console.error);
