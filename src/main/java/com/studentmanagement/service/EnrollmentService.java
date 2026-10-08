package com.studentmanagement.service;

import com.studentmanagement.exception.CourseFullException;
import com.studentmanagement.exception.ValidationException;
import com.studentmanagement.model.Course;
import com.studentmanagement.model.Enrollment;
import com.studentmanagement.model.Student;
import com.studentmanagement.repository.EnrollmentRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final StudentService studentService;
    private final CourseService courseService;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             StudentService studentService,
                             CourseService courseService) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentService = studentService;
        this.courseService = courseService;
    }

    public Enrollment enroll(String studentId, String courseId) {
        Student student = studentService.getById(studentId);
        Course course = courseService.getCourse(courseId);

        if (enrollmentRepository.findByStudentAndCourse(studentId, courseId) != null) {
            throw new ValidationException("Student is already actively enrolled in course: " + courseId);
        }

        if (!course.hasCapacity()) {
            throw new CourseFullException("Course '" + course.getName() + "' is full (" +
                    course.getEnrolledCount() + "/" + course.getCapacity() + " seats taken).");
        }

        // Atomically increment enrollment count with capacity check
        if (!courseService.incrementEnrollment(courseId)) {
            throw new CourseFullException("Course capacity was reached. Please choose another course.");
        }

        try {
            Enrollment enrollment = new Enrollment(
                    UUID.randomUUID().toString(),
                    studentId,
                    courseId,
                    LocalDate.now(),
                    "Not Assigned",
                    "ACTIVE"
            );
            enrollmentRepository.create(enrollment);
            studentService.addCourse(student.getId(), courseId);
            return enrollment;
        } catch (RuntimeException ex) {
            // Compensating transaction: roll back count increment
            courseService.decrementEnrollment(courseId);
            throw ex;
        }
    }

    public List<Enrollment> getAll() {
        return enrollmentRepository.findAll();
    }

    public List<Enrollment> getByStudent(String studentId) {
        studentService.getById(studentId);
        return enrollmentRepository.findByStudent(studentId);
    }

    public void assignGrade(String enrollmentId, String grade) {
        if (grade == null || grade.trim().isEmpty()) {
            throw new ValidationException("Grade cannot be empty.");
        }
        String cleanGrade = grade.trim().toUpperCase();
        if (!enrollmentRepository.updateGrade(enrollmentId, cleanGrade)) {
            throw new ValidationException("Enrollment not found with ID: " + enrollmentId);
        }
    }

    public void updateStatus(String enrollmentId, String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new ValidationException("Status cannot be empty.");
        }
        String cleanStatus = status.trim().toUpperCase();
        if (!List.of("ACTIVE", "COMPLETED", "DROPPED").contains(cleanStatus)) {
            throw new ValidationException("Status must be ACTIVE, COMPLETED, or DROPPED.");
        }
        if (!enrollmentRepository.updateStatus(enrollmentId, cleanStatus)) {
            throw new ValidationException("Enrollment not found with ID: " + enrollmentId);
        }
    }
}
