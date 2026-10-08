package com.studentmanagement;

import com.studentmanagement.exception.CourseFullException;
import com.studentmanagement.exception.StudentNotFoundException;
import com.studentmanagement.exception.ValidationException;
import com.studentmanagement.model.Course;
import com.studentmanagement.model.Enrollment;
import com.studentmanagement.model.Student;
import com.studentmanagement.repository.AdminRepository;
import com.studentmanagement.repository.CourseRepository;
import com.studentmanagement.repository.EnrollmentRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.service.CourseService;
import com.studentmanagement.service.EnrollmentService;
import com.studentmanagement.service.StudentService;
import com.studentmanagement.util.MongoConnection;

import java.util.List;
import java.util.Scanner;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);

    private static StudentService studentService;
    private static CourseService courseService;
    private static EnrollmentService enrollmentService;
    private static AdminRepository adminRepository;

    public static void main(String[] args) {
        printBanner();

        try {
            // Lazy initialization of services after ensuring MongoDB is reached
            initializeServices();
            initializeDatabase();
            startApplication();
        } catch (Exception e) {
            System.out.println("\nApplication could not start: " + e.getMessage());
            System.out.println("Check your MONGO_URI, database name, and MongoDB Atlas network access.");
        } finally {
            MongoConnection.close();
            scanner.close();
        }
    }

    private static void initializeServices() {
        StudentRepository studentRepository = new StudentRepository();
        CourseRepository courseRepository = new CourseRepository();
        EnrollmentRepository enrollmentRepository = new EnrollmentRepository();
        adminRepository = new AdminRepository();

        studentService = new StudentService(studentRepository);
        courseService = new CourseService(courseRepository);
        enrollmentService = new EnrollmentService(
                enrollmentRepository,
                studentService,
                courseService
        );
    }

    private static void initializeDatabase() {
        adminRepository.createIfAbsent(
                "System Administrator",
                "admin@srm.edu",
                "admin123"
        );
    }

    private static void startApplication() {
        while (true) {
            System.out.println("\n========== MAIN MENU ==========");
            System.out.println("1. Admin Login");
            System.out.println("2. Student Login");
            System.out.println("3. Exit");

            int choice = readInt("Choose an option: ");

            try {
                switch (choice) {
                    case 1 -> adminLogin();
                    case 2 -> studentLogin();
                    case 3 -> {
                        System.out.println("\nThank you for using the Student Management System. Goodbye!");
                        return;
                    }
                    default -> System.out.println("Invalid option. Please choose between 1 and 3.");
                }
            } catch (RuntimeException e) {
                handleError(e);
            }
        }
    }

    private static void adminLogin() {
        System.out.println("\n--- Admin Login ---");
        String email = read("Admin email: ");
        String password = read("Password: ");

        var admin = adminRepository.findByEmail(email);
        if (admin == null || !admin.getPassword().equals(password)) {
            System.out.println("Invalid admin credentials.");
            return;
        }

        System.out.println("\nWelcome back, " + admin.getName() + "!");
        adminMenu();
    }

    private static void studentLogin() {
        System.out.println("\n--- Student Login ---");
        String email = read("Student email: ");
        String password = read("Password: ");

        Student student = studentService.getAllStudents().stream()
                .filter(s -> s.getEmail().equalsIgnoreCase(email)
                        && s.getPassword().equals(password))
                .findFirst()
                .orElse(null);

        if (student == null) {
            System.out.println("Invalid student credentials.");
            return;
        }

        System.out.println("\nWelcome, " + student.getName() + "!");
        studentMenu(student);
    }

    private static void adminMenu() {
        while (true) {
            System.out.println("\n========== ADMIN MENU ==========");
            System.out.println("1.  Add Student");
            System.out.println("2.  View All Students");
            System.out.println("3.  Search Student by Roll Number");
            System.out.println("4.  Update Student Record");
            System.out.println("5.  Delete Student Record");
            System.out.println("6.  Add Course Offering");
            System.out.println("7.  View All Courses");
            System.out.println("8.  Update Course Offering");
            System.out.println("9.  Delete Course Offering");
            System.out.println("10. View All Enrollments");
            System.out.println("11. Assign Grade");
            System.out.println("12. Update Enrollment Status");
            System.out.println("13. View Most Enrolled Courses");
            System.out.println("14. Logout to Main Menu");

            int choice = readInt("Choose an option: ");

            try {
                switch (choice) {
                    case 1 -> addStudent();
                    case 2 -> viewStudents();
                    case 3 -> searchStudent();
                    case 4 -> updateStudent();
                    case 5 -> deleteStudent();
                    case 6 -> addCourse();
                    case 7 -> viewCourses();
                    case 8 -> updateCourse();
                    case 9 -> deleteCourse();
                    case 10 -> viewEnrollments(enrollmentService.getAll());
                    case 11 -> assignGrade();
                    case 12 -> updateEnrollmentStatus();
                    case 13 -> viewCourses(courseService.getMostEnrolledCourses(10));
                    case 14 -> {
                        System.out.println("Logged out from admin panel.");
                        return;
                    }
                    default -> System.out.println("Invalid choice. Please select 1 through 14.");
                }
            } catch (RuntimeException e) {
                handleError(e);
            }
        }
    }

    private static void studentMenu(Student student) {
        while (true) {
            System.out.println("\n========== STUDENT MENU ==========");
            System.out.println("1. View Profile");
            System.out.println("2. Browse Courses");
            System.out.println("3. Enroll in Course");
            System.out.println("4. View My Enrollments");
            System.out.println("5. Logout to Main Menu");

            int choice = readInt("Choose an option: ");

            try {
                switch (choice) {
                    case 1 -> System.out.println("\n" + student);
                    case 2 -> viewCourses();
                    case 3 -> {
                        String courseId = read("Enter Course ID to enroll: ");
                        Enrollment e = enrollmentService.enroll(student.getId(), courseId);
                        student.addCourse(courseId);
                        System.out.println("Enrollment successful! Reference ID: " + e.getId());
                    }
                    case 4 -> viewEnrollments(enrollmentService.getByStudent(student.getId()));
                    case 5 -> {
                        System.out.println("Logged out from student panel.");
                        return;
                    }
                    default -> System.out.println("Invalid choice. Please select 1 through 5.");
                }
            } catch (RuntimeException e) {
                handleError(e);
            }
        }
    }

    private static void addStudent() {
        System.out.println("\n--- Add Student ---");
        String name = read("Full Name: ");
        String email = read("Email Address: ");
        String password = read("Password: ");
        String roll = read("Roll Number: ");
        String department = read("Department (e.g. CSE, IT, ECE): ");
        int year = readInt("Academic Year (1-4): ");

        Student s = studentService.addStudent(
                name, email, password, roll, department, year
        );
        System.out.println("Student created successfully!");
        System.out.println(s);
    }

    private static void viewStudents() {
        System.out.println("\n--- Student Directory ---");
        List<Student> students = studentService.getAllStudents();
        if (students.isEmpty()) {
            System.out.println("No students registered in the database.");
            return;
        }
        for (Student s : students) {
            System.out.println(s);
        }
    }

    private static void searchStudent() {
        System.out.println("\n--- Search Student ---");
        String roll = read("Enter Roll Number: ");
        Student s = studentService.getByRollNumber(roll);
        System.out.println("Student found:");
        System.out.println(s);
    }

    private static void updateStudent() {
        System.out.println("\n--- Update Student ---");
        String id = read("Enter Student ID: ");
        Student s = studentService.getById(id);

        System.out.println("Leave blank to keep existing value:");
        String value;

        value = read("Name [" + s.getName() + "]: ");
        if (!value.isBlank()) s.setName(value);

        value = read("Email [" + s.getEmail() + "]: ");
        if (!value.isBlank()) s.setEmail(value);

        value = read("Password [hidden]: ");
        if (!value.isBlank()) s.setPassword(value);

        value = read("Roll Number [" + s.getRollNumber() + "]: ");
        if (!value.isBlank()) s.setRollNumber(value);

        value = read("Department [" + s.getDepartment() + "]: ");
        if (!value.isBlank()) s.setDepartment(value);

        value = read("Year [" + s.getYear() + "]: ");
        if (!value.isBlank()) s.setYear(Integer.parseInt(value));

        studentService.updateStudent(s);
        System.out.println("Student updated successfully!");
    }

    private static void deleteStudent() {
        System.out.println("\n--- Delete Student ---");
        String id = read("Enter Student ID to delete: ");
        studentService.deleteStudent(id);
        System.out.println("Student deleted successfully.");
    }

    private static void addCourse() {
        System.out.println("\n--- Add Course Offering ---");
        String id = read("Course Code/ID (e.g. CS101): ");
        String name = read("Course Name: ");
        String instructor = read("Instructor: ");
        int credits = readInt("Credits (1-6): ");
        int capacity = readInt("Total Seat Capacity: ");

        Course course = new Course(id, name, instructor, credits, capacity);
        courseService.addCourse(course);
        System.out.println("Course offering created successfully!");
    }

    private static void viewCourses() {
        viewCourses(courseService.getAllCourses());
    }

    private static void viewCourses(List<Course> courses) {
        if (courses.isEmpty()) {
            System.out.println("\nNo courses currently available.");
            return;
        }
        System.out.println("\n================================================================================");
        System.out.printf("%-10s | %-25s | %-18s | %-7s | %-8s | %-8s%n",
                "ID", "Course Name", "Instructor", "Credits", "Capacity", "Enrolled");
        System.out.println("--------------------------------------------------------------------------------");
        for (Course c : courses) {
            System.out.printf(
                    "%-10s | %-25s | %-18s | %-7d | %-8d | %-8d%n",
                    c.getId(), c.getName(), c.getInstructor(),
                    c.getCredits(), c.getCapacity(), c.getEnrolledCount()
            );
        }
        System.out.println("================================================================================");
    }

    private static void updateCourse() {
        System.out.println("\n--- Update Course Offering ---");
        String id = read("Enter Course ID: ");
        Course c = courseService.getCourse(id);

        System.out.println("Leave blank to keep existing value:");
        String value = read("Name [" + c.getName() + "]: ");
        if (!value.isBlank()) c.setName(value);

        value = read("Instructor [" + c.getInstructor() + "]: ");
        if (!value.isBlank()) c.setInstructor(value);

        value = read("Credits [" + c.getCredits() + "]: ");
        if (!value.isBlank()) c.setCredits(Integer.parseInt(value));

        value = read("Capacity [" + c.getCapacity() + "]: ");
        if (!value.isBlank()) c.setCapacity(Integer.parseInt(value));

        courseService.updateCourse(c);
        System.out.println("Course updated successfully!");
    }

    private static void deleteCourse() {
        System.out.println("\n--- Delete Course ---");
        String id = read("Enter Course ID to delete: ");
        courseService.deleteCourse(id);
        System.out.println("Course deleted successfully.");
    }

    private static void assignGrade() {
        System.out.println("\n--- Assign Grade ---");
        String enrollmentId = read("Enrollment ID: ");
        String grade = read("Grade (A, B, C, D, F): ");
        enrollmentService.assignGrade(enrollmentId, grade);
        System.out.println("Grade updated successfully.");
    }

    private static void updateEnrollmentStatus() {
        System.out.println("\n--- Update Enrollment Status ---");
        String enrollmentId = read("Enrollment ID: ");
        String status = read("Status (ACTIVE / COMPLETED / DROPPED): ").toUpperCase();
        enrollmentService.updateStatus(enrollmentId, status);
        System.out.println("Enrollment status updated successfully.");
    }

    private static void viewEnrollments(List<Enrollment> enrollments) {
        if (enrollments.isEmpty()) {
            System.out.println("\nNo enrollments found.");
            return;
        }
        System.out.println("\n================================================================================");
        System.out.printf("%-36s | %-12s | %-10s | %-10s | %-10s%n",
                "Enrollment ID", "Student ID", "Course", "Status", "Grade");
        System.out.println("--------------------------------------------------------------------------------");
        for (Enrollment e : enrollments) {
            System.out.printf(
                    "%-36s | %-12s | %-10s | %-10s | %-10s%n",
                    e.getId(), e.getStudentId(), e.getCourseId(), e.getStatus(), e.getGrade()
            );
        }
        System.out.println("================================================================================");
    }

    private static String read(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }

    private static int readInt(String prompt) {
        while (true) {
            try {
                return Integer.parseInt(read(prompt));
            } catch (NumberFormatException e) {
                System.out.println("Please enter a valid numeric number.");
            }
        }
    }

    private static void handleError(RuntimeException e) {
        if (e instanceof CourseFullException) {
            System.out.println("\n[COURSE CAPACITY ERROR] " + e.getMessage());
        } else if (e instanceof StudentNotFoundException) {
            System.out.println("\n[NOT FOUND ERROR] " + e.getMessage());
        } else if (e instanceof ValidationException) {
            System.out.println("\n[VALIDATION ERROR] " + e.getMessage());
        } else {
            System.out.println("\n[ERROR] " + e.getMessage());
        }
    }

    private static void printBanner() {
        System.out.println("======================================================");
        System.out.println("          STUDENT MANAGEMENT SYSTEM");
        System.out.println("        Java 17 + MongoDB Atlas + Maven");
        System.out.println("             SRM University - CSE");
        System.out.println("======================================================");
    }
}
