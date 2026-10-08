package com.studentmanagement.service;

import com.studentmanagement.exception.ValidationException;
import com.studentmanagement.model.Course;
import com.studentmanagement.repository.CourseRepository;

import java.util.List;

public class CourseService {
    private final CourseRepository repository;

    public CourseService(CourseRepository repository) {
        this.repository = repository;
    }

    public void addCourse(Course course) {
        validate(course);

        if (repository.findById(course.getId()) != null) {
            throw new ValidationException("Course ID already exists: " + course.getId());
        }
        repository.create(course);
    }

    public Course getCourse(String id) {
        Course c = repository.findById(id);
        if (c == null) {
            throw new ValidationException("Course not found with ID: " + id);
        }
        return c;
    }

    public List<Course> getAllCourses() {
        return repository.findAll();
    }

    public List<Course> getMostEnrolledCourses(int limit) {
        return repository.findMostEnrolled(limit);
    }

    public void updateCourse(Course course) {
        validate(course);
        getCourse(course.getId());

        if (course.getCapacity() < course.getEnrolledCount()) {
            throw new ValidationException(
                    "Capacity (" + course.getCapacity() + ") cannot be lower than currently enrolled students ("
                            + course.getEnrolledCount() + ")."
            );
        }
        if (!repository.update(course)) {
            throw new ValidationException("Course was not updated.");
        }
    }

    public void deleteCourse(String id) {
        Course c = getCourse(id);
        if (c.getEnrolledCount() > 0) {
            throw new ValidationException(
                    "Cannot delete course '" + id + "' because it currently has " + c.getEnrolledCount() + " enrolled student(s)."
            );
        }
        repository.delete(id);
    }

    public boolean incrementEnrollment(String courseId) {
        return repository.incrementEnrollment(courseId);
    }

    public boolean decrementEnrollment(String courseId) {
        return repository.decrementEnrollment(courseId);
    }

    private void validate(Course c) {
        if (c == null) {
            throw new ValidationException("Course cannot be null.");
        }
        if (isBlank(c.getId()) || isBlank(c.getName()) || isBlank(c.getInstructor())) {
            throw new ValidationException("Course ID, name, and instructor are all required.");
        }
        if (c.getCredits() <= 0) {
            throw new ValidationException("Course credits must be a positive number.");
        }
        if (c.getCapacity() <= 0) {
            throw new ValidationException("Course capacity must be a positive number.");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
