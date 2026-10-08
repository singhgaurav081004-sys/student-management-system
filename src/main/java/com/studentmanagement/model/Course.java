package com.studentmanagement.model;

public class Course {
    private String id;
    private String name;
    private String instructor;
    private int credits;
    private int capacity;
    private int enrolledCount;

    public Course() {
    }

    public Course(String id, String name, String instructor, int credits, int capacity) {
        this.id = id;
        this.name = name;
        this.instructor = instructor;
        this.credits = credits;
        this.capacity = capacity;
        this.enrolledCount = 0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getEnrolledCount() { return enrolledCount; }
    public void setEnrolledCount(int enrolledCount) { this.enrolledCount = enrolledCount; }

    public boolean hasCapacity() {
        return enrolledCount < capacity;
    }

    @Override
    public String toString() {
        return String.format(
            "Course{id='%s', name='%s', instructor='%s', credits=%d, capacity=%d, enrolled=%d}",
            id, name, instructor, credits, capacity, enrolledCount
        );
    }
}
