package com.studentmanagement;

import com.studentmanagement.model.Student;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.util.MongoConnection;

public class StudentRepositoryTest {
    public static void main(String[] args) {
        try {
            StudentRepository repository = new StudentRepository();

            // Clear a previous test record so the test can be rerun.
            repository.deleteStudent("TEST001");

            Student student = new Student(
                    "TEST001", "Test Student", "test@student.com",
                    "test123", "ROLL001", "Computer Science", 1
            );

            System.out.println("Saving student...");
            repository.saveStudent(student);
            System.out.println("Student saved successfully.");

            System.out.println("\nFinding student by ID...");
            Student found = repository.findStudentById("TEST001");
            if (found != null) {
                System.out.println("Student found!");
                System.out.println("ID: " + found.getId());
                System.out.println("Name: " + found.getName());
                System.out.println("Email: " + found.getEmail());
                System.out.println("Roll Number: " + found.getRollNumber());
                System.out.println("Department: " + found.getDepartment());
                System.out.println("Year: " + found.getYear());
            } else {
                System.out.println("Student not found.");
            }

            System.out.println("\nFinding all students...");
            System.out.println("Total students found: " + repository.findAllStudents().size());

            System.out.println("\nDeleting test student...");
            repository.deleteStudent("TEST001");
            System.out.println(repository.findStudentById("TEST001") == null
                    ? "Test student deleted successfully."
                    : "Warning: test student still exists.");
        } catch (Exception e) {
            System.out.println("Repository test failed.");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            MongoConnection.closeConnection();
        }
    }
}
