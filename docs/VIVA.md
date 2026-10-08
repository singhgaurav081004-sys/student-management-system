# Viva Voce & Defense Preparation Guide

Comprehensive questions and answers for defending the Student Management System project during an academic viva.

---

### 1. Architectural & Design Questions

#### Q1: What architecture does this application use and why?
**Answer:** The project follows a **Layered Architecture (3-Tier)**:
1. **Presentation / UI Layer:** `Main.java` (interactive console menu).
2. **Service / Business Logic Layer:** `StudentService`, `CourseService`, `EnrollmentService`.
3. **Data Access / Repository Layer:** `StudentRepository`, `CourseRepository`, `EnrollmentRepository`, `AdminRepository`.
4. **Data Store:** MongoDB Atlas cloud cluster via `MongoConnection`.

**Why:** Separation of concerns ensures high maintainability, testability, and code reusability. The UI never interacts directly with the database; all business rules (such as seat capacity limits and email uniqueness) are strictly validated in the service layer before reaching the repository.

#### Q2: Why choose MongoDB over a traditional Relational Database (SQL)?
**Answer:**
- **Document Model Alignment:** Academic records such as students and course enrollments naturally fit document structures with nested arrays (e.g. `enrolledCourseIds`).
- **Flexible Schema Evolution:** Adding new student attributes (like phone numbers, GPA, address) requires zero costly database migrations or schema alterations.
- **Cloud-Native Scalability:** MongoDB Atlas provides automated cloud provisioning, horizontal sharding, replication, and managed security out of the box.

---

### 2. Implementation & Business Logic Questions

#### Q3: How is concurrency and course over-enrollment prevented?
**Answer:**
In `CourseRepository.incrementEnrollment(courseId)`:
```java
Filters.and(
    Filters.eq("_id", courseId),
    new Document("$expr", new Document("$lt", List.of("$enrolledCount", "$capacity")))
)
```
MongoDB's `updateOne` executes atomically at the document level. If two concurrent threads attempt to enroll the last remaining seat, only one update will match the filter where `enrolledCount < capacity`. The second attempt modifies 0 documents and fails gracefully.

#### Q4: How is data consistency maintained without multi-document transactions?
**Answer:**
In `EnrollmentService.enroll(studentId, courseId)`:
1. The student and course are verified for existence.
2. Duplicate active enrollments are blocked.
3. The course capacity is atomically incremented via `courseService.incrementEnrollment(courseId)`.
4. The enrollment document is created and added to the student's list.
5. If the persistence step throws an exception, a **compensating transaction** executes immediately: `courseService.decrementEnrollment(courseId)`.

#### Q5: What custom exceptions exist in the codebase?
**Answer:**
1. `ValidationException`: Raised when input violates validation constraints (e.g., malformed email, negative credits, year outside 1–4, duplicate roll number).
2. `CourseFullException`: Raised when all seats in a course offering are occupied.
3. `StudentNotFoundException`: Raised when an operation requests a non-existent student record.

---

### 3. Security & Operational Questions

#### Q6: Why are database credentials not hardcoded in the source code?
**Answer:**
Hardcoding sensitive credentials in source code exposes secrets to version control (Git/GitHub) and decompiled binaries. Instead, `MongoConnection` reads `MONGO_URI` and `MONGO_DATABASE` from system environment variables at runtime, adhering to Twelve-Factor App principles.

#### Q7: What are the future enhancements for production deployment?
**Answer:**
- **Password Security:** Use BCrypt or Argon2 password hashing instead of plaintext strings.
- **Authentication & Auth:** Transition to JWT tokens or role-based session management.
- **Web API Layer:** Expose RESTful endpoints using Spring Boot.
- **Frontend UI:** Build a modern responsive single-page web app (React / Vite).
