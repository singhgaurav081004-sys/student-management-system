package com.studentmanagement.model;

import java.util.ArrayList;
import java.util.List;

public class Student extends User {
    private String rollNumber;
    private String department;
    private int year;
    private List<String> enrolledCourseIds = new ArrayList<>();

    public Student() {
        super();
    }

    public Student(String id, String name, String email, String password,
                   String rollNumber, String department, int year) {
        super(id, name, email, password);
        this.rollNumber = rollNumber;
        this.department = department;
        this.year = year;
        this.enrolledCourseIds = new ArrayList<>();
    }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public List<String> getEnrolledCourseIds() { return enrolledCourseIds; }
    public void setEnrolledCourseIds(List<String> enrolledCourseIds) {
        this.enrolledCourseIds = (enrolledCourseIds == null) ? new ArrayList<>() : enrolledCourseIds;
    }

    public void addCourse(String courseId) {
        if (!enrolledCourseIds.contains(courseId)) {
            enrolledCourseIds.add(courseId);
        }
    }

    @Override
    public String toString() {
        return String.format(
            "Student{id='%s', name='%s', email='%s', rollNumber='%s', department='%s', year=%d, enrolledCourses=%d}",
            id, name, email, rollNumber, department, year, enrolledCourseIds != null ? enrolledCourseIds.size() : 0
        );
    }
}
