# Project Report: Student Management System

**Academic Year:** 2025–2026  
**Language & Runtime:** Java 17 LTS  
**Build System:** Apache Maven 3.9+  
**Database:** MongoDB Atlas (NoSQL Cloud Database)  

---

## 1. Executive Summary

The Student Management System (SMS) is an enterprise-patterned Java application designed to manage student academic life cycles, department offerings, course catalogs, and course enrollments. Built with a clean layered architecture, the application isolates user interaction from core business rules and MongoDB Atlas cloud operations.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph Presentation Layer
        A[Console User Interface Main.java]
        B[Admin Menu]
        C[Student Menu]
    end

    subgraph Service Layer - Business Logic
        D[StudentService]
        E[CourseService]
        F[EnrollmentService]
        G[Validation & Exception Handling]
    end

    subgraph Repository Layer - Data Access
        H[StudentRepository]
        I[CourseRepository]
        J[EnrollmentRepository]
        K[AdminRepository]
    end

    subgraph Infrastructure
        L[MongoConnection Utility]
        M[(MongoDB Atlas Cloud DB)]
    end

    A --> B
    A --> C
    B --> D
    B --> E
    B --> F
    C --> D
    C --> E
    C --> F

    D --> G
    E --> G
    F --> G

    D --> H
    E --> I
    F --> J
    F --> H
    F --> I
    A --> K

    H --> L
    I --> L
    J --> L
    K --> L

    L --> M
```

---

## 3. Class Diagram

```mermaid
classDiagram
    class User {
        <<abstract>>
        #String id
        #String name
        #String email
        #String password
        +getId() String
        +getName() String
        +getEmail() String
    }

    class Admin {
        +toString() String
    }

    class Student {
        -String rollNumber
        -String department
        -int year
        -List~String~ enrolledCourseIds
        +addCourse(String courseId)
        +toString() String
    }

    class Course {
        -String id
        -String name
        -String instructor
        -int credits
        -int capacity
        -int enrolledCount
        +hasCapacity() boolean
        +toString() String
    }

    class Enrollment {
        -String id
        -String studentId
        -String courseId
        -LocalDate enrollmentDate
        -String grade
        -String status
        +toString() String
    }

    User <|-- Admin
    User <|-- Student
    Student "1" ..> "0..*" Enrollment : enrolls in
    Course "1" ..> "0..*" Enrollment : contains
```

---

## 4. Enrollment Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student / Admin
    participant UI as Main.java
    participant ES as EnrollmentService
    participant CR as CourseRepository
    participant ER as EnrollmentRepository
    participant SR as StudentRepository
    participant DB as MongoDB Atlas

    User->>UI: Select Enroll in Course (courseId)
    UI->>ES: enroll(studentId, courseId)
    ES->>ER: findByStudentAndCourse(studentId, courseId)
    Note over ES: Verify duplicate active registration
    ES->>CR: incrementEnrollment(courseId)
    CR->>DB: updateOne with {$expr: {$lt: [enrolledCount, capacity]}}
    alt Capacity Reached
        DB-->>CR: modifiedCount = 0
        CR-->>ES: false
        ES-->>UI: throws CourseFullException
    else Seat Available
        DB-->>CR: modifiedCount = 1
        CR-->>ES: true
        ES->>ER: create(Enrollment)
        ER->>DB: insertOne(enrollmentDoc)
        ES->>SR: addCourseToStudent(studentId, courseId)
        SR->>DB: updateOne $addToSet enrolledCourseIds
        ES-->>UI: return Enrollment object
        UI-->>User: "Enrollment successful!"
    end
```

---

## 5. Functional Modules

### 5.1 Admin Module
- **Student Management:** Full CRUD (Create, Read, Search by Roll Number, Update fields, Delete).
- **Course Catalog:** Create offerings with credits & seat capacities, update instructor/capacity, safe deletion (only if enrolled count == 0).
- **Enrollment Oversight:** View all active/past enrollments, assign grades (A, B, C, D, F), update enrollment status (ACTIVE, COMPLETED, DROPPED).
- **Analytics:** Most enrolled courses query using descending sort.

### 5.2 Student Module
- **Self-Service Profile:** View registration details and enrolled course list.
- **Course Browsing:** View available seats, course titles, instructors, and credit units.
- **Self-Enrollment:** Instant registration with immediate capacity check.
- **My Enrollments:** Real-time visibility into enrollment statuses and posted grades.

---

## 6. Verification and Test Results

The test suite validates:
1. **Student Model:** Attribute mapping and duplicate course prevention in local array.
2. **Course Model:** Real-time capacity computation and threshold boundaries.
3. **Enrollment Model:** Default status, date tracking, and grade updates.
4. **Validation Logic:** Regex email pattern checking and year boundaries (1–4).
5. **Exceptions:** Verification of `ValidationException`, `CourseFullException`, and `StudentNotFoundException`.

**Automated Test Result:** 27 / 27 Passed (100% Pass Rate).
