# Database Design & MongoDB Schema

Database Name: `student_management` (configurable via `MONGO_DATABASE` environment variable)

## Collections Overview

The Student Management System uses four core MongoDB collections representing the academic domain:
1. `admins`
2. `students`
3. `courses`
4. `enrollments`

---

## 1. `admins` Collection

Stores credentials and profile details for administrative operators.

### Sample Document
```json
{
  "_id": "c1f7a0b5-901b-4f9e-a0bf-65778b40cdae",
  "name": "System Administrator",
  "email": "admin@srm.edu",
  "password": "admin123"
}
```

### Fields
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | String (UUID) | Unique identifier for the administrator |
| `name` | String | Full name of the administrator |
| `email` | String | Unique login email |
| `password` | String | Authentication password |

---

## 2. `students` Collection

Stores student personal and academic records, including references to enrolled courses.

### Sample Document
```json
{
  "_id": "f83a219a-9e32-47ef-b72e-360e206ab621",
  "name": "Gaurav Singh",
  "email": "gaurav@srm.edu",
  "password": "studentpassword",
  "rollNumber": "RA2511026001",
  "department": "CSE(AIML)",
  "year": 2,
  "enrolledCourseIds": ["CS101", "CS102"]
}
```

### Fields
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Primary Key | Unique student ID |
| `name` | String | Required | Full name |
| `email` | String | Unique, Valid Email | Academic email address |
| `password` | String | Required | Student login password |
| `rollNumber` | String | Unique | Official university roll number |
| `department` | String | Required | Department / Major (e.g., CSE) |
| `year` | Integer | 1 <= year <= 4 | Academic standing year |
| `enrolledCourseIds` | Array of Strings | Referenced | List of enrolled course IDs |

---

## 3. `courses` Collection

Maintains course catalog offerings, instructors, credits, and live enrollment occupancy.

### Sample Document
```json
{
  "_id": "CS101",
  "name": "Data Structures & Algorithms",
  "instructor": "Dr. Sharma",
  "credits": 4,
  "capacity": 60,
  "enrolledCount": 1
}
```

### Fields
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String | Primary Key | Course Code (e.g. CS101) |
| `name` | String | Required | Title of the course |
| `instructor` | String | Required | Faculty member teaching the course |
| `credits` | Integer | > 0 | Academic credit units |
| `capacity` | Integer | > 0 | Maximum number of seats |
| `enrolledCount` | Integer | 0 <= count <= capacity | Live tally of registered students |

---

## 4. `enrollments` Collection

Represents the many-to-many relationship linking a student to an active or completed course offering.

### Sample Document
```json
{
  "_id": "a933ff22-0d65-455b-8041-35b11a58c8db",
  "studentId": "f83a219a-9e32-47ef-b72e-360e206ab621",
  "courseId": "CS101",
  "enrollmentDate": "2026-10-09",
  "grade": "Not Assigned",
  "status": "ACTIVE"
}
```

### Fields
| Field | Type | Values / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `_id` | String (UUID) | Primary Key | Unique registration reference |
| `studentId` | String | Foreign key | References `students._id` |
| `courseId` | String | Foreign key | References `courses._id` |
| `enrollmentDate`| String (ISO-8601)| Date | Date when registration occurred |
| `grade` | String | A, B, C, D, F, "Not Assigned" | Evaluated grade |
| `status` | String | ACTIVE, COMPLETED, DROPPED | Current status of enrollment |

---

## Recommended Indexes

For optimal query performance on MongoDB Atlas:

```javascript
// Ensure email and roll numbers are strictly unique across students
db.students.createIndex({ "rollNumber": 1 }, { unique: true });
db.students.createIndex({ "email": 1 }, { unique: true });

// Fast lookup for admin authentication
db.admins.createIndex({ "email": 1 }, { unique: true });

// Prevent duplicate active enrollments for same student and course
db.enrollments.createIndex({ "studentId": 1, "courseId": 1, "status": 1 });

// Fast sorting for popular courses
db.courses.createIndex({ "enrolledCount": -1 });
```
