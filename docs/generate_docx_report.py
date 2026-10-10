import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_code_block(doc, code_text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Background light gray
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), 'F1F5F9')
    tcPr.append(shd)
    
    # Border
    borders = OxmlElement('w:tcBorders')
    for b_name in ['top', 'left', 'bottom', 'right']:
        b = OxmlElement(f'w:{b_name}')
        b.set(qn('w:val'), 'single')
        b.set(qn('w:sz'), '4')
        b.set(qn('w:space'), '0')
        b.set(qn('w:color'), 'CBD5E1')
        borders.append(b)
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(code_text.strip())
    run.font.name = 'Consolas'
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph() # Spacing

def build_report():
    doc = Document()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    screenshots_dir = os.path.join(base_dir, 'screenshots')

    # Configure Margins: 1 inch (72 pt)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Style Defaults
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0, 0, 0)

    # Helper functions
    def title_p(text, size=16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(space_after)
        run = p.add_run(text)
        run.bold = bold
        run.font.size = Pt(size)
        run.font.name = 'Times New Roman'
        return p

    def heading_1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(12)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(14)
        run.font.name = 'Times New Roman'
        return p

    def heading_2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12.5)
        run.font.name = 'Times New Roman'
        return p

    def body_p(text, space_after=6, justify=True):
        p = doc.add_paragraph()
        if justify:
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.35
        run = p.add_run(text)
        run.font.size = Pt(12)
        run.font.name = 'Times New Roman'
        return p

    def bullet_p(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        run_b = p.add_run(bold_prefix)
        run_b.bold = True
        run_b.font.name = 'Times New Roman'
        run_b.font.size = Pt(12)
        run_t = p.add_run(text)
        run_t.font.name = 'Times New Roman'
        run_t.font.size = Pt(12)
        return p

    def add_image_figure(img_filename, caption_text, width=Inches(5.8)):
        img_path = os.path.join(screenshots_dir, img_filename)
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.add_run().add_picture(img_path, width=width)
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(12)
            run = p_cap.add_run(caption_text)
            run.bold = True
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10.5)

    # ================= PAGE 1: TITLE / COVER PAGE =================
    title_p("STUDENT MANAGEMENT SYSTEM", size=15, bold=True, space_after=2)
    title_p("21CSC203P/ADVANCED PROGRAMMING\nPRACTICE PROJECT REPORT", size=13, bold=True, space_after=32)
    
    title_p("Submitted by", size=12, bold=False, space_after=6)
    title_p("GAURAV SINGH RA2511026030018", size=13, bold=True, space_after=32)
    
    title_p("Under the guidance of", size=12, bold=False, space_after=6)
    title_p("Dr. S. Palanivel", size=13, bold=True, space_after=2)
    title_p("(Associate Professor, Department of\nComputer Science and Engineering)", size=11, bold=False, space_after=32)
    
    title_p("in partial fulfilment for the award of the degree\nof", size=11, bold=False, space_after=4)
    title_p("BACHELOR OF TECHNOLOGY", size=13, bold=True, space_after=4)
    title_p("in", size=11, bold=False, space_after=4)
    title_p("COMPUTER SCIENCE AND ENGINEERING", size=13, bold=True, space_after=12)
    title_p("Of\nFACULTY OF ENGINEERING AND", size=11.5, bold=True, space_after=6)
    
    logo_path = os.path.join(screenshots_dir, 'srm_logo_0.png')
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(2)
        p_logo.paragraph_format.space_after = Pt(4)
        p_logo.add_run().add_picture(logo_path, width=Inches(1.8))
        
    title_p("TECHNOLOGY", size=12, bold=True, space_after=24)
    title_p("SRM INSTITUTE OF SCIENCE & TECHNOLOGY, NCR CAMPUS", size=12, bold=True, space_after=12)
    doc.add_page_break()

    # ================= PAGE 2: BONAFIDE CERTIFICATE =================
    title_p("SRM INSTITUTE OF SCIENCE AND TECHNOLOGY", size=13, bold=True, space_after=4)
    title_p("(Deemed to be University U/S 3 of UGC Act, 1956)", size=11, bold=False, space_after=18)
    title_p("BONAFIDE CERTIFICATE", size=14, bold=True, space_after=24)
    
    body_p("Certified that this project report titled STUDENT MANAGEMENT SYSTEM is the bonafide work of GAURAV SINGH (RA2511026030018) who carried out the project work under my supervision. Certified further, that to the best of my knowledge the work reported herein does not form any other project report or dissertation on the basis of which a degree or award was conferred on an occasion on this or any other candidate.", space_after=48)
    
    tbl_cert = doc.add_table(rows=2, cols=2)
    tbl_cert.alignment = WD_TABLE_ALIGNMENT.CENTER
    c00 = tbl_cert.cell(0, 0)
    c01 = tbl_cert.cell(0, 1)
    c10 = tbl_cert.cell(1, 0)
    c11 = tbl_cert.cell(1, 1)
    
    c00.paragraphs[0].add_run("SIGNATURE\n\n\n\n").bold = True
    c00.paragraphs[0].add_run("Dr. S. Palanivel\nAssociate Professor\nComputer Science & Engineering,\nSRM Institute of Science and Technology,\nDelhi-NCR")
    
    c01.paragraphs[0].add_run("SIGNATURE\n\n\n\n").bold = True
    c01.paragraphs[0].add_run("Dr. Harish Taluja\nHead of the Department\nComputer Science & Engineering,\nSRM Institute of Science and Technology,\nDelhi-NCR")
    
    doc.add_paragraph()
    body_p("Submitted for the project viva-voce held on ________________ at SRM Institute of Science and Technology, Delhi-NCR", space_after=12)
    doc.add_page_break()

    # ================= PAGE 3: DECLARATION =================
    title_p("DECLARATION", size=14, bold=True, space_after=36)
    body_p("I hereby declare that the entire work contained in this project report titled STUDENT MANAGEMENT SYSTEM has been carried out by GAURAV SINGH (RA2511026030018) at SRM Institute of Science and Technology, Delhi-NCR, under the guidance of Dr. S. Palanivel, Associate Professor, Department of Computer Science and Engineering.", space_after=72)
    
    p_dec = doc.add_paragraph()
    p_dec.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run_d = p_dec.add_run("GAURAV SINGH (RA2511026030018)\nDepartment of Computer Science & Engineering\nSRM Institute of Science and Technology, Delhi-NCR")
    run_d.bold = True
    doc.add_page_break()

    # ================= PAGE 4: ABSTRACT =================
    title_p("ABSTRACT", size=14, bold=True, space_after=24)
    body_p("In modern tertiary education institutions, managing voluminous student records, dynamic course catalogs, faculty allocations, seat capacity thresholds, and multi-tier grade evaluations presents severe administrative and concurrency challenges. Traditional manual or spreadsheet-based tracking methods suffer from severe race conditions during high-volume course registration windows, lack of transactional consistency, poor data security, and absence of real-time analytical visibility for department heads and administrators.", space_after=12)
    body_p("This project presents an enterprise-patterned, full-stack Student Management System (SMS) built with a modular 3-tier architecture. The system leverages Java 17 LTS, MongoDB Atlas cloud database, Maven automation, and a responsive web dashboard deployed globally on Vercel (https://sms-delta-eight.vercel.app). The backend implements robust business service validation, custom exception boundaries, and atomic database queries to guarantee ACID consistency during concurrent operations.", space_after=12)
    body_p("Key capabilities include complete student profile lifecycle management (CRUD, unique roll-number validation, department and year tracking), course catalog administration with credit limits and atomic capacity tracking, and student self-service enrollment with instantaneous prerequisite and seat validation. Concurrency safety is achieved in MongoDB through atomic $expr conditional updates preventing over-enrollment, backed by compensating rollback transactions.", space_after=12)
    body_p("The frontend provides a polished dark-mode interface featuring real-time stat cards, dynamic search and filtering, modal grade evaluation dialogs, and instant persistence. A comprehensive automated test suite of 27 test cases verifies 100% functionality across models, validation rules, and custom exception handlers, ensuring an error-resilient platform ready for academic adoption.", space_after=18)
    doc.add_page_break()

    # ================= PAGE 5 & 6: TABLE OF CONTENTS =================
    title_p("TABLE OF CONTENTS", size=14, bold=True, space_after=18)
    
    toc_data = [
        ("ABSTRACT", "1"),
        ("Table of Contents", "2-3"),
        ("List of Figures", "4"),
        ("Chapter 01: Introduction", "5-9"),
        ("  1.1 Background of the Problem", "5"),
        ("  1.2 Problem Statement", "6-7"),
        ("  1.3 Project Objectives", "8"),
        ("  1.4 Scope and Motivation", "9"),
        ("Chapter 02: Existing Systems and Technologies", "10-11"),
        ("  2.1 Overview of Current Student Management Tools", "10"),
        ("  2.2 Limitations of Existing Solutions", "11"),
        ("Chapter 03: System Design and Methodology", "12-18"),
        ("  3.1 Architecture Overview (Block Diagrams)", "12-13"),
        ("  3.2 Database Design (MongoDB Document Schema & ER)", "14-15"),
        ("  3.3 Technology Stack Description", "15-16"),
        ("  3.4 Proposed Methodology and Workflow", "16-18"),
        ("Chapter 04: Implementation", "19-25"),
        ("  4.1 Backend Development (Java 17, Service Layer, Exceptions)", "19-21"),
        ("  4.2 Data Persistence & MongoDB Atlas Integration", "22-24"),
        ("  4.3 Frontend & Web Server Development (Vercel & HTTP Server)", "24-25"),
        ("Chapter 05: Results", "26-29"),
        ("  5.0 Overview of System Deployment", "26"),
        ("  5.1 Home Page & Analytics Dashboard", "26"),
        ("  5.2 Student Directory & Lifecycle Management", "27"),
        ("  5.3 Course Catalog & Seat Occupancy", "27"),
        ("  5.4 Course Enrollment & Real-Time Grading", "28"),
        ("  5.5 Evaluation & Status Update Modal", "28"),
        ("  5.6 Automated Test Suite Execution & CLI Output", "29"),
        ("Chapter 06: Challenges and Solutions", "30-32"),
        ("  6.1 Technical Challenges Faced", "30-31"),
        ("  6.2 Solution Approaches", "31-32"),
        ("Chapter 07: Conclusion and Future Work", "33-35"),
        ("  7.1 Summary of Achievements", "33"),
        ("  7.2 Potential Enhancements", "34"),
        ("  7.3 Final Thoughts", "35"),
        ("Chapter 08: References", "36")
    ]
    
    tbl_toc = doc.add_table(rows=len(toc_data), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, (item, page_str) in enumerate(toc_data):
        cell_item = tbl_toc.cell(i, 0)
        cell_pg = tbl_toc.cell(i, 1)
        p_i = cell_item.paragraphs[0]
        p_i.paragraph_format.line_spacing = 1.15
        p_i.paragraph_format.space_after = Pt(2)
        r_i = p_i.add_run(item)
        r_i.font.name = 'Times New Roman'
        r_i.font.size = Pt(11)
        if item.startswith("Chapter") or item in ["ABSTRACT", "Table of Contents", "List of Figures"]:
            r_i.bold = True
            
        p_p = cell_pg.paragraphs[0]
        p_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_p.paragraph_format.line_spacing = 1.15
        p_p.paragraph_format.space_after = Pt(2)
        r_p = p_p.add_run(page_str)
        r_p.font.name = 'Times New Roman'
        r_p.font.size = Pt(11)
        if item.startswith("Chapter") or item in ["ABSTRACT", "Table of Contents", "List of Figures"]:
            r_p.bold = True
            
    doc.add_page_break()

    # ================= PAGE 7: LIST OF FIGURES =================
    title_p("LIST OF FIGURES", size=14, bold=True, space_after=18)
    
    lof_data = [
        ("Fig 3.1", "3-Tier System Architecture Block Diagram", "13"),
        ("Fig 3.2", "MongoDB Document Schema & Entity Relationship Model", "15"),
        ("Fig 5.1", "Home Page & Real-Time Academic KPI Dashboard", "26"),
        ("Fig 5.2", "Student Directory & Department Filtering Interface", "27"),
        ("Fig 5.3", "Course Catalog with Seat Capacity & Credit Hours", "27"),
        ("Fig 5.4", "Enrollment Oversight & Evaluation Table", "28"),
        ("Fig 5.5", "Interactive Grade & Academic Status Modal Dialog", "28"),
        ("Fig 5.6", "Automated System Test Suite Verification Terminal (27/27 Passed)", "29")
    ]
    
    tbl_lof = doc.add_table(rows=len(lof_data)+1, cols=3)
    tbl_lof.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Headers
    h0 = tbl_lof.cell(0, 0).paragraphs[0].add_run("Fig No")
    h0.bold = True
    h1 = tbl_lof.cell(0, 1).paragraphs[0].add_run("Figure Name")
    h1.bold = True
    h2 = tbl_lof.cell(0, 2).paragraphs[0].add_run("Page No")
    h2.bold = True
    tbl_lof.cell(0, 2).paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
    
    for i, (fno, fname, pno) in enumerate(lof_data, start=1):
        r0 = tbl_lof.cell(i, 0).paragraphs[0].add_run(fno)
        r0.font.name = 'Times New Roman'
        r1 = tbl_lof.cell(i, 1).paragraphs[0].add_run(fname)
        r1.font.name = 'Times New Roman'
        p_num = tbl_lof.cell(i, 2).paragraphs[0]
        p_num.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r2 = p_num.add_run(pno)
        r2.font.name = 'Times New Roman'
        
    doc.add_page_break()

    # ================= CHAPTER 01: INTRODUCTION =================
    heading_1("CHAPTER 01\n\nINTRODUCTION")
    heading_2("1.1 Background of the Problem")
    body_p("Higher education institutions are dynamic ecosystems that manage the academic progression of thousands of students across dozens of disciplines. Over the past decade, rapid growth in university enrollments, modular interdisciplinary curriculum structures, and increasing compliance mandates have transformed academic administration into a data-intensive operation.")
    body_p("At the center of academic operations lies the student lifecycle: admitting new students, tracking departmental affiliations, maintaining course offerings, enforcing prerequisite and credit caps, processing course enrollments, and evaluating final grades. Historically, academic institutions relied on manual paperwork or distributed spreadsheets (such as Microsoft Excel or Google Sheets) maintained independently by disparate department offices.")
    body_p("However, spreadsheet-driven systems break down rapidly under modern institutional demands. Multiple staff members modifying isolated copies of files lead to data silos, version skew, and missing records. Most critically, during peak course registration windows, simultaneous attempts to enroll in limited-capacity courses result in race conditions, overselling seats, and severe operational confusion. The transition toward centralized, cloud-enabled Student Management Systems (SMS) is essential to preserve institutional integrity and operational clarity.")

    heading_2("1.2 Problem Statement")
    body_p("Academic institutions face profound operational bottlenecks and risks when using legacy, decentralized management approaches. Critical problems identified include:")
    bullet_p("Concurrency and Race Conditions: ", "During peak enrollment periods, simultaneous registration attempts by students for popular courses result in over-enrollment beyond classroom seating limits when systems lack atomic capacity verification.")
    bullet_p("Data Inconsistency and Fragmentation: ", "Isolated records across department spreadsheets result in mismatched roll numbers, duplicate student records, untracked course changes, and erroneous academic transcripts.")
    bullet_p("Absence of Instant Analytical Visibility: ", "University deans and department heads lack unified dashboards to monitor enrollment trends, track department-wise cohort distributions, or identify under-subscribed courses in real time.")
    bullet_p("Lack of Accessibility and Cloud Resilience: ", "Legacy desktop-only database applications fail to provide secure, cross-device web accessibility for administrators and students, preventing flexible remote management.")
    body_p("Consequently, there is an urgent need for an automated, scalable, and resilient Student Management System that pairs a strict enterprise backend with a modern, high-performance web dashboard accessible from any browser.")

    heading_2("1.3 Project Objectives")
    body_p("The primary objectives of this Student Management System project are:")
    bullet_p("Architect a Modular 3-Tier Enterprise Application: ", "Enforce strict separation of concerns across a presentation layer, a Java 17 business logic service layer, and a cloud NoSQL data persistence layer.")
    bullet_p("Cloud Data Persistence with MongoDB Atlas: ", "Establish secure, scalable document storage for students, courses, enrollments, and administrators with connection pooling and SSL encryption.")
    bullet_p("Enforce Atomic Concurrency Controls: ", "Implement conditional atomic updates ($expr with $lt constraints) to ensure course seat capacity thresholds are never exceeded under concurrent registration demands.")
    bullet_p("Develop Comprehensive Business Validation: ", "Provide rigorous validation for student roll numbers, email regex patterns, academic year ranges (1-4), course credit units, and valid grade codes.")
    bullet_p("Deliver a High-Performance Responsive Web Dashboard: ", "Build and deploy an interactive dark-mode web application on Vercel with real-time stat cards, dynamic search, and seamless enrollment workflows.")
    bullet_p("Automate Quality Verification: ", "Implement an automated test suite to rigorously validate all business models, validation rules, capacity edge cases, and custom exceptions.")

    heading_2("1.4 Scope and Motivation")
    body_p("Scope:")
    body_p("This project delivers a complete academic ERP management solution including:")
    bullet_p("Student Lifecycle Management: ", "Adding students with unique roll numbers and emails, updating academic profiles, filtering by department, and viewing enrolled courses.")
    bullet_p("Course Catalog Administration: ", "Registering courses with credit allocations, assigned instructors, and strict seat quotas; querying most-enrolled courses.")
    bullet_p("Transactional Enrollment Engine: ", "Enrolling students into courses with atomic capacity checks, duplicate registration prevention, and compensating rollback transactions.")
    bullet_p("Grade & Evaluation Processing: ", "Administering letter grades (A, B, C, D, F) and updating status lifecycles (ACTIVE, COMPLETED, DROPPED).")
    bullet_p("Cloud Production Deployment: ", "Hosting the web application globally on Vercel (https://sms-delta-eight.vercel.app) with persistent client storage and zero infrastructure overhead.")
    body_p("Motivation:")
    body_p("The motivation behind this project stems from the critical need in academic institutions for reliable, real-time, and user-friendly software that eliminates administrative errors and empowers students and faculty with instantaneous visibility into their academic standing.")
    doc.add_page_break()

    # ================= CHAPTER 02: EXISTING SYSTEMS AND TECHNOLOGIES =================
    heading_1("CHAPTER 02\n\nEXISTING SYSTEMS AND TECHNOLOGIES")
    heading_2("2.1 Overview of Current Student Management Tools")
    body_p("A variety of approaches and commercial solutions are presently utilized within academic environments to manage student information and enrollments:")
    bullet_p("1. Manual Spreadsheets and Legacy Flat-File Systems: ", "Smaller colleges often rely on Microsoft Excel or Google Sheets. While accessible and easy to deploy initially, they lack database constraints, ACID transaction guarantees, role-based authorization, and concurrent write safety.")
    bullet_p("2. Enterprise Resource Planning (ERP) Platforms: ", "Commercial university ERP suites such as Banner by Ellucian, PeopleSoft Campus Solutions, and SAP Student Lifecycle Management provide comprehensive feature sets. However, they are prohibitively expensive, require multi-year implementations, and impose complex, dated user interfaces.")
    bullet_p("3. Open-Source Academic Management Tools: ", "Open-source platforms like OpenSIS or Fedena provide web-based school administration. Nonetheless, many depend on traditional relational schemas that struggle with dynamic document structures or lack optimized client-side interactivity.")
    bullet_p("4. In-House Bespoke Systems: ", "Custom systems built by campus IT teams frequently suffer from architectural drift, inadequate concurrency handling during add/drop registration weeks, and tightly coupled codebases that complicate updates.")

    heading_2("2.2 Limitations of Existing Solutions")
    body_p("Despite the availability of existing tools, notable shortcomings persist across current academic implementations:")
    bullet_p("1. Susceptibility to Concurrency Race Conditions: ", "Relational locks in legacy systems often trigger deadlocks or allow seat over-subscription when hundreds of students concurrently register for high-demand elective courses.")
    bullet_p("2. Prohibitive Capital & Operational Costs: ", "Commercial ERP solutions require six-figure licensing fees, expensive database administrators, and complex on-premises server infrastructure.")
    bullet_p("3. Rigid Data Models: ", "Relational SQL schemas require cumbersome schema migration scripts whenever new academic fields, elective categories, or evaluation metrics are introduced.")
    bullet_p("4. Poor User Experience & Mobile Incompatibility: ", "Older institutional portals feature cluttered, non-responsive interfaces that confuse students and administrators, lacking real-time client-side search and modern aesthetics.")
    bullet_p("5. Lack of Resilient Cloud Deployment: ", "On-premises servers frequently crash during peak result publication or course registration windows due to unoptimized architectures lacking edge-cloud distribution.")
    doc.add_page_break()

    # ================= CHAPTER 03: SYSTEM DESIGN AND METHODOLOGY =================
    heading_1("CHAPTER 03\n\nSYSTEM DESIGN AND METHODOLOGY")
    heading_2("3.1 Architecture Overview (Block Diagrams Explained)")
    body_p("The Student Management System is engineered using an enterprise 3-tier architectural model that ensures strict decoupling, maintainability, and scalability:")
    bullet_p("1. Presentation Layer (Client Browser & CLI): ", "Provides dual interfaces for system interaction. The primary interface is a responsive, dark-mode Single Page Application (SPA) deployed globally on Vercel. It interacts seamlessly with backend endpoints using the asynchronous Fetch API and manages client-side caching. An interactive ANSI-styled console interface (Main.java) provides direct command-line administration.")
    bullet_p("2. Business Logic Layer (Java 17 LTS Services): ", "Encapsulates all domain workflows and business rules within dedicated services: StudentService, CourseService, and EnrollmentService. This layer validates student parameters, verifies course prerequisites, coordinates atomic seat increments, handles compensating transactions, and enforces custom exception boundaries.")
    bullet_p("3. Data Persistence Layer (MongoDB Atlas NoSQL Cloud): ", "Houses document collections (students, courses, enrollments, admins) hosted in a high-availability MongoDB Atlas cluster. Repositories map BSON documents to strongly typed Java domain models and execute high-speed atomic update operations.")
    
    add_image_figure("fig3_1_architecture_diagram.png", "Figure 3.1: 3-Tier System Architecture Block Diagram", width=Inches(5.8))

    heading_2("3.2 Database Design (MongoDB Document Schema & ER)")
    body_p("The database is structured around flexible NoSQL document schemas that optimize read performance and atomic update operations without requiring multi-table SQL joins:")
    bullet_p("students Collection: ", "Stores student profiles with unique roll numbers and emails, department names, academic year integers, and an embedded array of enrolled course IDs.")
    bullet_p("courses Collection: ", "Maintains course offerings including unique course code IDs, titles, instructor names, credit hours, total seat capacity, and current enrolled student count.")
    bullet_p("enrollments Collection: ", "Captures the transactional association between students and courses, storing ISO timestamps, current letter grades (A-F, Not Assigned), and lifecycle statuses (ACTIVE, COMPLETED, DROPPED).")
    
    add_image_figure("fig3_2_database_schema.png", "Figure 3.2: MongoDB Document Schema & Entity Relationship Model", width=Inches(5.8))

    heading_2("3.3 Technology Stack Description")
    bullet_p("Programming Language: ", "Java 17 LTS & modern ECMAScript (JavaScript ES6+).")
    bullet_p("Build Automation & Dependency Management: ", "Apache Maven 3.9+ managing MongoDB Java Driver, SLF4J, and JUnit dependencies.")
    bullet_p("Database Engine: ", "MongoDB Atlas Cloud NoSQL Database (version 7.0+), providing automated sharding, replication, and wire-level TLS encryption.")
    bullet_p("Embedded Web Server: ", "Java com.sun.net.httpserver.HttpServer serving dynamic RESTful JSON endpoints and static assets without requiring heavy external servlet containers.")
    bullet_p("Frontend UI & Styling: ", "Semantic HTML5, Vanilla CSS3 utilizing modular CSS Custom Properties (Design Tokens), responsive CSS Grid, and Flexbox.")
    bullet_p("Cloud Hosting & Edge Distribution: ", "Vercel Cloud Platform providing global CDN caching, automated SSL certificates, and zero-maintenance continuous deployment.")

    heading_2("3.4 Proposed Methodology and Workflow")
    body_p("The development and execution workflow followed an iterative engineering approach comprising five structured phases:")
    bullet_p("Phase 1 - Domain Modeling & Schema Specification: ", "Defined core domain entities (User, Admin, Student, Course, Enrollment) and designed MongoDB document schemas with unique indexes.")
    bullet_p("Phase 2 - Repository & Atomic Persistence Layer: ", "Implemented repository classes with the MongoDB Java driver, incorporating conditional query filters to guarantee thread-safe seat capacity updates.")
    bullet_p("Phase 3 - Business Logic & Validation Engine: ", "Built service classes with strict parameter sanitization, regex email validation, academic year constraints, and custom exception hierarchies.")
    bullet_p("Phase 4 - Web Application & Global Deployment: ", "Developed a responsive web management interface and deployed the production package to Vercel with localized state persistence.")
    bullet_p("Phase 5 - Automated Testing & Verification: ", "Authored a 27-test verification suite and interactive CLI menu to thoroughly test edge cases, capacity overflow, and error handling.")
    doc.add_page_break()

    # ================= CHAPTER 04: IMPLEMENTATION =================
    heading_1("CHAPTER 04\n\nIMPLEMENTATION")
    heading_2("4.1 Backend Development (Java 17, Service Layer, Exceptions)")
    body_p("The backend business logic is implemented in Java 17 LTS following enterprise domain-driven design principles. The service layer orchestrates workflows between the repositories and presentation controllers while enforcing business rules.")
    body_p("A central innovation is the transactional enrollment mechanism within EnrollmentService.java. It enforces active registration checks, validates remaining course capacity, performs atomic incrementation, and executes compensating rollback transactions if persistence errors occur:")

    add_code_block(doc, """// Snippet: EnrollmentService.java - Transactional Enrollment Logic
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
}""")

    heading_2("4.2 Data Persistence & MongoDB Atlas Integration")
    body_p("Data access is abstracted through dedicated repository classes using the official MongoDB Java Synchronous Driver. To prevent race conditions during high-concurrency registration, CourseRepository.java executes atomic conditional updates utilizing the $expr operator:")

    add_code_block(doc, """// Snippet: CourseRepository.java - Atomic Conditional Capacity Increment
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
}""")

    heading_2("4.3 Frontend & Web Server Development (Vercel & HTTP Server)")
    body_p("The web management interface is built with modern Vanilla JavaScript and CSS3 design tokens, avoiding bulky frontend framework dependencies. The client application manages state via localStorage for instant edge loading and seamlessly interfaces with the Java WebServer REST endpoints:")

    add_code_block(doc, """// Snippet: app.js - Client-Side State Management & Evaluation Logic
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
}""")
    doc.add_page_break()

    # ================= CHAPTER 05: RESULTS =================
    heading_1("CHAPTER 05\n\nRESULTS")
    heading_2("5.0 Overview of System Deployment")
    body_p("The Student Management System has been fully compiled, tested, and deployed to global cloud production on Vercel at the official URL: https://sms-delta-eight.vercel.app. Below are the verified output screens documenting each major system functional module.")

    heading_2("5.1 Home Page & Analytics Dashboard")
    body_p("The production Home Dashboard provides academic leadership with an immediate visual overview of institutional health, displaying real-time stat cards for total registered students, active courses, enrollment totals, and average course seat utilization.")
    add_image_figure("fig5_1_home_dashboard.png", "Figure 5.1: Home Page & Real-Time Academic KPI Dashboard (Live on Vercel)", width=Inches(5.8))

    heading_2("5.2 Student Directory & Lifecycle Management")
    body_p("The Student Management interface allows administrators to search student records by name or roll number, filter cohorts by academic department (Computer Science, Electrical, Mechanical), and register new students.")
    add_image_figure("fig5_2_students_directory.png", "Figure 5.2: Student Directory with Dynamic Search & Department Filtering", width=Inches(5.8))

    heading_2("5.3 Course Catalog & Seat Occupancy")
    body_p("The Course Catalog displays active curriculum offerings with assigned instructors, credit units, and live seat occupancy meters, preventing manual scheduling conflicts.")
    add_image_figure("fig5_3_course_catalog.png", "Figure 5.3: Course Catalog Interface with Seat Capacity Meters", width=Inches(5.8))

    heading_2("5.4 Course Enrollment & Real-Time Grading")
    body_p("The Enrollment Oversight module lists student enrollments with direct actions for updating academic grades and modifying registration statuses.")
    add_image_figure("fig5_4_enrollments_management.png", "Figure 5.4: Enrollment Oversight Table with Live Grade Status", width=Inches(5.8))

    heading_2("5.5 Evaluation & Status Update Modal")
    body_p("A responsive modal dialog allows instructors and administrators to evaluate student performance, assign standard letter grades (A, B, C, D, F), and transition enrollment statuses (ACTIVE, COMPLETED, DROPPED).")
    add_image_figure("fig5_5_grade_evaluation_modal.png", "Figure 5.5: Interactive Grade Evaluation & Academic Status Modal Dialog", width=Inches(5.8))

    heading_2("5.6 Automated Test Suite Execution & Verification")
    body_p("The automated system test suite verifies all domain entities, validation logic, capacity bounds, and custom exception handling. All 27 automated tests executed with a 100% success rate.")
    add_image_figure("fig5_6_test_suite_execution.png", "Figure 5.6: Automated System Test Suite Execution Terminal (27/27 Tests Passed)", width=Inches(5.8))
    doc.add_page_break()

    # ================= CHAPTER 06: CHALLENGES AND SOLUTIONS =================
    heading_1("CHAPTER 06\n\nCHALLENGES AND SOLUTIONS")
    heading_2("6.1 Technical Challenges Faced")
    bullet_p("1. Concurrency Race Conditions on Course Capacity: ", "During simulated concurrent enrollment requests, standard read-then-write database operations allowed seat counts to exceed maximum limits.")
    bullet_p("2. Asynchronous MongoDB Atlas Handshake Delays: ", "Cold-start connection handshakes with remote MongoDB Atlas clusters over TLS caused minor latency spikes during initial server bootstrap.")
    bullet_p("3. Cross-Platform Cloud Deployment Constraints: ", "Hosting a Java backend on serverless static edge platforms like Vercel required decoupling static client presentation from backend persistence.")
    bullet_p("4. Data Validation and Error Isolation: ", "Ensuring malformed user inputs (e.g. invalid emails, negative capacity, out-of-range academic years) were intercepted before reaching database collections.")

    heading_2("6.2 Solution Approaches")
    bullet_p("1. MongoDB Atomic Conditional Updates ($expr): ", "Solved race conditions by shifting capacity verification directly into MongoDB's atomic execution engine using $expr: {$lt: ['$enrolledCount', '$capacity']}.")
    bullet_p("2. Compensating Rollback Transactions: ", "Implemented a compensating transaction in EnrollmentService that automatically decrements course capacity if an enrollment persistence error occurs.")
    bullet_p("3. Dual-Mode Presentation & LocalStorage State Bridge: ", "Engineered a dual-mode client architecture with localStorage client persistence on Vercel and RESTful HTTP syncing when connected to the local Java server.")
    bullet_p("4. Comprehensive Custom Exception Hierarchy: ", "Created distinct domain exceptions (ValidationException, CourseFullException, StudentNotFoundException) mapped to clear user toast alerts.")
    doc.add_page_break()

    # ================= CHAPTER 07: CONCLUSION AND FUTURE WORK =================
    heading_1("CHAPTER 07\n\nCONCLUSION AND FUTURE WORK")
    heading_2("7.1 Summary of Achievements")
    body_p("The Student Management System successfully demonstrates a robust, modern academic platform built using enterprise architectural patterns. Key milestones achieved include:")
    bullet_p("Full-Stack Enterprise Architecture: ", "Clean decoupling of Presentation, Business Logic, and Data Persistence layers.")
    bullet_p("Thread-Safe Capacity Enforcement: ", "Zero over-enrollments guaranteed via atomic MongoDB updates.")
    bullet_p("Global Production Cloud Deployment: ", "Live, accessible web application on Vercel at https://sms-delta-eight.vercel.app.")
    bullet_p("Comprehensive Verification: ", "100% automated test pass rate across 27 business rule test cases.")

    heading_2("7.2 Potential Enhancements")
    bullet_p("1. Role-Based Access Control (RBAC): ", "Integration of JWT-based authentication with differentiated permission views for students, instructors, and deans.")
    bullet_p("2. Automated PDF Transcript Generation: ", "Adding server-side PDF generation to produce official grade sheets and semester transcripts on demand.")
    bullet_p("3. Real-Time WebSocket Notifications: ", "Push notifications for students when waitlisted course seats become available.")

    heading_2("7.3 Final Thoughts")
    body_p("This project demonstrates that combining modern cloud databases (MongoDB Atlas) with robust enterprise runtimes (Java 17) and edge-deployed web frontends (Vercel) yields an academic management platform that is significantly more dependable, responsive, and cost-effective than legacy institutional ERP systems.")
    doc.add_page_break()

    # ================= CHAPTER 08: REFERENCES =================
    heading_1("CHAPTER 08\n\nREFERENCES")
    refs = [
        "1. Oracle Corporation. (2023). Java Platform, Standard Edition Documentation (Version 17 LTS). Available at https://docs.oracle.com/en/java/javase/17/",
        "2. MongoDB Inc. (2023). MongoDB Atlas Cloud Database Manual and MongoDB Java Driver Documentation. Available at https://www.mongodb.com/docs/",
        "3. Apache Software Foundation. (2023). Apache Maven Project Management and Build Automation. Available at https://maven.apache.org/",
        "4. Vercel Inc. (2024). Vercel Cloud Platform Documentation and Edge Network Deployment. Available at https://vercel.com/docs/",
        "5. World Wide Web Consortium (W3C). (2023). HTML5 & CSS3 Specification Standards. Available at https://www.w3.org/standards/",
        "6. Bloch, J. (2018). Effective Java (3rd ed.). Addison-Wesley Professional.",
        "7. Fowler, M. (2002). Patterns of Enterprise Application Architecture. Addison-Wesley.",
        "8. Singh, G. (2026). Student Management System (SMS) Source Repository [GitHub]. Available at https://github.com/singhgaurav081004-sys/student-management-system",
        "9. Singh, G. (2026). Student Management System Live Production Web Application [Vercel]. Available at https://sms-delta-eight.vercel.app"
    ]
    for r in refs:
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_ref.paragraph_format.space_after = Pt(8)
        p_ref.paragraph_format.line_spacing = 1.25
        run = p_ref.add_run(r)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11)

    out_path = os.path.join(base_dir, 'STUDENT_MANAGEMENT_SYSTEM_PROJECT_REPORT.docx')
    doc.save(out_path)
    print(f"Report DOCX generated successfully at: {out_path}")

if __name__ == '__main__':
    build_report()
