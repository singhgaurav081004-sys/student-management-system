package com.studentmanagement.repository;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.studentmanagement.model.Student;
import com.studentmanagement.util.MongoConnection;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

public class StudentRepository {
    private final MongoCollection<Document> studentCollection;

    public StudentRepository() {
        MongoDatabase database = MongoConnection.getDatabase();
        this.studentCollection = database.getCollection("students");
    }

    public void create(Student s) {
        Document document = new Document()
                .append("_id", s.getId())
                .append("name", s.getName())
                .append("email", s.getEmail())
                .append("password", s.getPassword())
                .append("rollNumber", s.getRollNumber())
                .append("department", s.getDepartment())
                .append("year", s.getYear())
                .append("enrolledCourseIds", s.getEnrolledCourseIds());
        studentCollection.insertOne(document);
    }

    public void saveStudent(Student student) {
        create(student);
    }

    public Student findById(String id) {
        Document document = studentCollection.find(Filters.eq("_id", id)).first();
        return document == null ? null : fromDocument(document);
    }

    public Student findStudentById(String id) {
        return findById(id);
    }

    public Student findByRollNumber(String rollNumber) {
        Document document = studentCollection.find(Filters.eq("rollNumber", rollNumber)).first();
        return document == null ? null : fromDocument(document);
    }

    public Student findByEmail(String email) {
        Document document = studentCollection.find(Filters.eq("email", email)).first();
        return document == null ? null : fromDocument(document);
    }

    public List<Student> findAll() {
        List<Student> students = new ArrayList<>();
        for (Document document : studentCollection.find()) {
            students.add(fromDocument(document));
        }
        return students;
    }

    public List<Student> findAllStudents() {
        return findAll();
    }

    public boolean update(Student s) {
        Document update = new Document("$set", new Document()
                .append("name", s.getName())
                .append("email", s.getEmail())
                .append("password", s.getPassword())
                .append("rollNumber", s.getRollNumber())
                .append("department", s.getDepartment())
                .append("year", s.getYear())
                .append("enrolledCourseIds", s.getEnrolledCourseIds()));
        return studentCollection.updateOne(Filters.eq("_id", s.getId()), update).getModifiedCount() > 0;
    }

    public boolean addCourseToStudent(String studentId, String courseId) {
        return studentCollection.updateOne(
                Filters.eq("_id", studentId),
                new Document("$addToSet", new Document("enrolledCourseIds", courseId))
        ).getModifiedCount() > 0;
    }

    public boolean delete(String id) {
        return studentCollection.deleteOne(Filters.eq("_id", id)).getDeletedCount() > 0;
    }

    public void deleteStudent(String id) {
        delete(id);
    }

    private Student fromDocument(Document document) {
        Student student = new Student(
                document.getString("_id"),
                document.getString("name"),
                document.getString("email"),
                document.getString("password"),
                document.getString("rollNumber"),
                document.getString("department"),
                document.getInteger("year", 1)
        );
        List<String> ids = document.getList("enrolledCourseIds", String.class, new ArrayList<>());
        student.setEnrolledCourseIds(ids);
        return student;
    }
}
