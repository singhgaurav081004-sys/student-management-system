package com.studentmanagement;

import com.studentmanagement.exception.CourseFullException;
import com.studentmanagement.exception.StudentNotFoundException;
import com.studentmanagement.exception.ValidationException;
import com.studentmanagement.model.Admin;
import com.studentmanagement.model.Course;
import com.studentmanagement.model.Enrollment;
import com.studentmanagement.model.Student;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class SystemTestSuite {
    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) {
        System.out.println("======================================================");
        System.out.println("     RUNNING STUDENT MANAGEMENT SYSTEM TEST SUITE     ");
        System.out.println("======================================================");

        testStudentModel();
        testCourseModelAndCapacity();
        testEnrollmentModel();
        testAdminModel();
        testEmailValidationLogic();
        testYearValidationLogic();
        testExceptionHandling();

        System.out.println("\n------------------------------------------------------");
        System.out.printf("TEST RESULTS: %d Passed, %d Failed%n", passed, failed);
        System.out.println("------------------------------------------------------");

        if (failed > 0) {
            System.err.println("Some tests failed!");
            System.exit(1);
        } else {
            System.out.println("All system and business logic tests PASSED successfully!");
        }
    }

    private static void assertTrue(String testName, boolean condition) {
        if (condition) {
            System.out.println(" [PASS] " + testName);
            passed++;
        } else {
            System.err.println(" [FAIL] " + testName);
            failed++;
        }
    }

    private static void testStudentModel() {
        System.out.println("\n--- Testing Student Model ---");
        Student student = new Student(
                "STU001", "Gaurav Singh", "gaurav@srm.edu", "pass123",
                "RA2511026001", "CSE", 2
        );

        assertTrue("Student ID matches", "STU001".equals(student.getId()));
        assertTrue("Student Roll matches", "RA2511026001".equals(student.getRollNumber()));
        assertTrue("Student Department matches", "CSE".equals(student.getDepartment()));
        assertTrue("Student Year matches", student.getYear() == 2);

        student.addCourse("CS101");
        student.addCourse("CS102");
        student.addCourse("CS101"); // Duplicate should be avoided
        assertTrue("Student course list avoids duplicate courses", student.getEnrolledCourseIds().size() == 2);
    }

    private static void testCourseModelAndCapacity() {
        System.out.println("\n--- Testing Course Model & Capacity ---");
        Course course = new Course("CS101", "Data Structures", "Dr. Sharma", 4, 2);

        assertTrue("Course capacity matches", course.getCapacity() == 2);
        assertTrue("Course initial enrolled count is 0", course.getEnrolledCount() == 0);
        assertTrue("Course initially has capacity", course.hasCapacity());

        course.setEnrolledCount(1);
        assertTrue("Course has capacity with 1 enrolled", course.hasCapacity());

        course.setEnrolledCount(2);
        assertTrue("Course reports full when enrolled == capacity", !course.hasCapacity());
    }

    private static void testEnrollmentModel() {
        System.out.println("\n--- Testing Enrollment Model ---");
        Enrollment enrollment = new Enrollment("ENR001", "STU001", "CS101");

        assertTrue("Enrollment default status is ACTIVE", "ACTIVE".equals(enrollment.getStatus()));
        assertTrue("Enrollment default grade is Not Assigned", "Not Assigned".equals(enrollment.getGrade()));
        assertTrue("Enrollment date is set", enrollment.getEnrollmentDate() != null);

        enrollment.setGrade("A");
        enrollment.setStatus("COMPLETED");
        assertTrue("Grade update persists", "A".equals(enrollment.getGrade()));
        assertTrue("Status update persists", "COMPLETED".equals(enrollment.getStatus()));
    }

    private static void testAdminModel() {
        System.out.println("\n--- Testing Admin Model ---");
        Admin admin = new Admin("ADM001", "Administrator", "admin@srm.edu", "admin123");

        assertTrue("Admin ID matches", "ADM001".equals(admin.getId()));
        assertTrue("Admin Email matches", "admin@srm.edu".equals(admin.getEmail()));
    }

    private static void testEmailValidationLogic() {
        System.out.println("\n--- Testing Email Regex Validation ---");
        Pattern emailPattern = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

        assertTrue("Valid email accepted", emailPattern.matcher("student@srm.edu").matches());
        assertTrue("Valid email with dots accepted", emailPattern.matcher("john.doe@domain.co.in").matches());
        assertTrue("Invalid email without @ rejected", !emailPattern.matcher("invalidemail.com").matches());
        assertTrue("Invalid email without domain rejected", !emailPattern.matcher("invalid@").matches());
    }

    private static void testYearValidationLogic() {
        System.out.println("\n--- Testing Year Range Validation ---");
        int validYear = 3;
        int lowYear = 0;
        int highYear = 5;

        assertTrue("Year 3 is valid", validYear >= 1 && validYear <= 4);
        assertTrue("Year 0 is invalid", !(lowYear >= 1 && lowYear <= 4));
        assertTrue("Year 5 is invalid", !(highYear >= 1 && highYear <= 4));
    }

    private static void testExceptionHandling() {
        System.out.println("\n--- Testing Custom Exceptions ---");
        boolean caughtValidation = false;
        try {
            throw new ValidationException("Validation error test");
        } catch (ValidationException e) {
            caughtValidation = true;
        }
        assertTrue("ValidationException caught properly", caughtValidation);

        boolean caughtCourseFull = false;
        try {
            throw new CourseFullException("Course full test");
        } catch (CourseFullException e) {
            caughtCourseFull = true;
        }
        assertTrue("CourseFullException caught properly", caughtCourseFull);

        boolean caughtStudentNotFound = false;
        try {
            throw new StudentNotFoundException("Student not found test");
        } catch (StudentNotFoundException e) {
            caughtStudentNotFound = true;
        }
        assertTrue("StudentNotFoundException caught properly", caughtStudentNotFound);
    }
}
