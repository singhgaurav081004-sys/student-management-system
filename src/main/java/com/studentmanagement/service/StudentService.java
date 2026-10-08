package com.studentmanagement.service;

import com.studentmanagement.exception.StudentNotFoundException;
import com.studentmanagement.exception.ValidationException;
import com.studentmanagement.model.Student;
import com.studentmanagement.repository.StudentRepository;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

public class StudentService {
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public Student addStudent(String name, String email, String password,
                              String rollNumber, String department, int year) {
        validate(name, email, password, rollNumber, department, year);

        if (repository.findByRollNumber(rollNumber) != null) {
            throw new ValidationException("Roll number already exists: " + rollNumber);
        }
        if (repository.findByEmail(email) != null) {
            throw new ValidationException("Email already exists: " + email);
        }

        Student s = new Student(
                UUID.randomUUID().toString(),
                name.trim(),
                email.trim(),
                password,
                rollNumber.trim(),
                department.trim(),
                year
        );
        repository.create(s);
        return s;
    }

    public Student getById(String id) {
        Student s = repository.findById(id);
        if (s == null) {
            throw new StudentNotFoundException("Student not found with ID: " + id);
        }
        return s;
    }

    public Student getByRollNumber(String rollNumber) {
        Student s = repository.findByRollNumber(rollNumber);
        if (s == null) {
            throw new StudentNotFoundException("Student not found for roll number: " + rollNumber);
        }
        return s;
    }

    public List<Student> getAllStudents() {
        return repository.findAll();
    }

    public void updateStudent(Student s) {
        if (s == null) {
            throw new ValidationException("Student cannot be null.");
        }
        validate(s.getName(), s.getEmail(), s.getPassword(),
                s.getRollNumber(), s.getDepartment(), s.getYear());

        Student byRoll = repository.findByRollNumber(s.getRollNumber());
        if (byRoll != null && !byRoll.getId().equals(s.getId())) {
            throw new ValidationException("Roll number already belongs to another student.");
        }

        Student byEmail = repository.findByEmail(s.getEmail());
        if (byEmail != null && !byEmail.getId().equals(s.getId())) {
            throw new ValidationException("Email already belongs to another student.");
        }

        if (!repository.update(s)) {
            throw new StudentNotFoundException("Student record could not be updated.");
        }
    }

    public void deleteStudent(String id) {
        getById(id);
        repository.delete(id);
    }

    public void addCourse(String studentId, String courseId) {
        getById(studentId);
        repository.addCourseToStudent(studentId, courseId);
    }

    private void validate(String name, String email, String password,
                          String rollNumber, String department, int year) {
        if (isBlank(name) || isBlank(email) || isBlank(password)
                || isBlank(rollNumber) || isBlank(department)) {
            throw new ValidationException("All student fields (name, email, password, roll number, department) are required.");
        }
        if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new ValidationException("Invalid email format: " + email);
        }
        if (year < 1 || year > 4) {
            throw new ValidationException("Year must be between 1 and 4.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
