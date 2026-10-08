package com.studentmanagement.repository;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.studentmanagement.model.Enrollment;
import com.studentmanagement.util.MongoConnection;
import org.bson.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EnrollmentRepository {
    private final MongoCollection<Document> enrollmentCollection;

    public EnrollmentRepository() {
        MongoDatabase database = MongoConnection.getDatabase();
        this.enrollmentCollection = database.getCollection("enrollments");
    }

    public void create(Enrollment e) {
        Document doc = new Document("_id", e.getId())
                .append("studentId", e.getStudentId())
                .append("courseId", e.getCourseId())
                .append("enrollmentDate", e.getEnrollmentDate() != null ? e.getEnrollmentDate().toString() : LocalDate.now().toString())
                .append("grade", e.getGrade())
                .append("status", e.getStatus());
        enrollmentCollection.insertOne(doc);
    }

    public Enrollment findById(String id) {
        Document d = enrollmentCollection.find(Filters.eq("_id", id)).first();
        return d == null ? null : fromDocument(d);
    }

    public Enrollment findByStudentAndCourse(String studentId, String courseId) {
        Document d = enrollmentCollection.find(
                Filters.and(
                        Filters.eq("studentId", studentId),
                        Filters.eq("courseId", courseId),
                        Filters.eq("status", "ACTIVE")
                )
        ).first();
        return d == null ? null : fromDocument(d);
    }

    public List<Enrollment> findAll() {
        List<Enrollment> result = new ArrayList<>();
        for (Document d : enrollmentCollection.find()) {
            result.add(fromDocument(d));
        }
        return result;
    }

    public List<Enrollment> findByStudent(String studentId) {
        List<Enrollment> result = new ArrayList<>();
        for (Document d : enrollmentCollection.find(Filters.eq("studentId", studentId))) {
            result.add(fromDocument(d));
        }
        return result;
    }

    public boolean updateGrade(String id, String grade) {
        return enrollmentCollection.updateOne(
                Filters.eq("_id", id),
                new Document("$set", new Document("grade", grade))
        ).getModifiedCount() > 0;
    }

    public boolean updateStatus(String id, String status) {
        return enrollmentCollection.updateOne(
                Filters.eq("_id", id),
                new Document("$set", new Document("status", status))
        ).getModifiedCount() > 0;
    }

    private Enrollment fromDocument(Document d) {
        Enrollment e = new Enrollment();
        e.setId(d.getString("_id"));
        e.setStudentId(d.getString("studentId"));
        e.setCourseId(d.getString("courseId"));
        String date = d.getString("enrollmentDate");
        e.setEnrollmentDate(date == null ? LocalDate.now() : LocalDate.parse(date));
        e.setGrade(d.getString("grade"));
        e.setStatus(d.getString("status"));
        return e;
    }
}
