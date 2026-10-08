# Student Management System

A production-grade, menu-driven Java 17 application using MongoDB Atlas, built with a clean layered 3-tier architecture.

---

## 🌟 Key Features

- **Layered 3-Tier Architecture:** Complete separation between Console UI, Business Service layer, Data Repositories, and MongoDB Atlas.
- **Admin Management:**
  - Add, search, view, update, and delete students.
  - Create and manage course catalogs with credit and capacity limits.
  - Safe course deletion (cannot delete courses with active enrollments).
  - Assign grades (`A`, `B`, `C`, `D`, `F`) and update statuses (`ACTIVE`, `COMPLETED`, `DROPPED`).
  - View most-enrolled courses ranking.
- **Student Portal:**
  - Profile inspection.
  - Course browsing with live seat occupancy.
  - Self-enrollment with atomic capacity constraints.
  - Personal enrollment and grade tracking.
- **Enterprise Concurrency & Consistency:**
  - Atomic document updates with conditional capacity matching in MongoDB.
  - Compensating transactions if enrollment persistence encounters an error.
  - Duplicate email and roll-number rejection.
- **Comprehensive Documentation:**
  - [docs/DATABASE.md](file:///c:/Users/Win10/Downloads/sms_updated_package/docs/DATABASE.md): Schema, collections, and index specifications.
  - [docs/REPORT.md](file:///c:/Users/Win10/Downloads/sms_updated_package/docs/REPORT.md): Full architectural report, Mermaid sequence, and class diagrams.
  - [docs/VIVA.md](file:///c:/Users/Win10/Downloads/sms_updated_package/docs/VIVA.md): Complete viva defense questions and model answers.

---

## 🏗️ Architecture

```text
Presentation Layer (Main.java - Interactive Console UI)
          │
          ▼
Service Layer (StudentService, CourseService, EnrollmentService)
          │
          ▼
Repository Layer (StudentRepository, CourseRepository, EnrollmentRepository, AdminRepository)
          │
          ▼
Database Utility (MongoConnection via MONGO_URI)
          │
          ▼
MongoDB Atlas Cloud Cluster
```

---

## 📋 Requirements

- **JDK 17 LTS**
- **Apache Maven 3.9+**
- **MongoDB Atlas Cluster** (with current IP whitelisted in Network Access)
- Local environment variable `MONGO_URI`

---

## ⚙️ Configuration

Set your MongoDB Atlas connection string:

### Windows PowerShell
```powershell
$env:MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority"
$env:MONGO_DATABASE="student_management"
```

### macOS / Linux
```bash
export MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority"
export MONGO_DATABASE="student_management"
```

A template file is available in [.env.example](file:///c:/Users/Win10/Downloads/sms_updated_package/.env.example).

---

## 🚀 Build & Run

### 1. Compile the Project
```bash
mvn clean compile
```

### 2. Run the Interactive Application
```bash
mvn exec:java
```

### 3. Run the Automated Test Suite
```bash
java -cp target/classes com.studentmanagement.SystemTestSuite
```

---

## 🔐 Default Credentials

On initial startup, the database automatically initializes the default administrator if not already present:
- **Admin Email:** `admin@srm.edu`
- **Admin Password:** `admin123`

---

## 🧪 Testing

- **Business Logic & Validation Suite:** Run `com.studentmanagement.SystemTestSuite` (validates models, email regex, academic year boundaries, course capacity logic, and custom exceptions).
- **MongoDB Connection Check:** Run `com.studentmanagement.MongoConnectionTest`.
- **Student Repository Integration Test:** Run `com.studentmanagement.StudentRepositoryTest`.

## ?? Live Web Application & Vercel Deployment

- **Live Production URL:** [https://sms-delta-eight.vercel.app](https://sms-delta-eight.vercel.app)
- **Local Web Server:** Run mvn exec:java -Dexec.mainClass="com.studentmanagement.web.WebServer" to serve the web UI at http://localhost:8081.
- **Frontend Stack:** Vanilla JS, CSS3 Design Tokens, Dark Mode, Responsive Tables, Stat Cards, and LocalStorage client-side persistence for standalone deployment.
