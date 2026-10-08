package com.studentmanagement.repository;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import com.studentmanagement.model.Course;
import com.studentmanagement.util.MongoConnection;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

public class CourseRepository {
    private final MongoCollection<Document> courseCollection;

    public CourseRepository() {
        MongoDatabase database = MongoConnection.getDatabase();
        this.courseCollection = database.getCollection("courses");
    }

    public void create(Course c) {
        Document doc = new Document("_id", c.getId())
                .append("name", c.getName())
                .append("instructor", c.getInstructor())
                .append("credits", c.getCredits())
                .append("capacity", c.getCapacity())
                .append("enrolledCount", c.getEnrolledCount());
        courseCollection.insertOne(doc);
    }

    public Course findById(String id) {
        Document d = courseCollection.find(Filters.eq("_id", id)).first();
        return d == null ? null : fromDocument(d);
    }

    public List<Course> findAll() {
        List<Course> result = new ArrayList<>();
        for (Document d : courseCollection.find()) {
            result.add(fromDocument(d));
        }
        return result;
    }

    public List<Course> findMostEnrolled(int limit) {
        List<Course> result = new ArrayList<>();
        for (Document d : courseCollection.find().sort(Sorts.descending("enrolledCount")).limit(limit)) {
            result.add(fromDocument(d));
        }
        return result;
    }

    public boolean update(Course c) {
        Document update = new Document("$set", new Document()
                .append("name", c.getName())
                .append("instructor", c.getInstructor())
                .append("credits", c.getCredits())
                .append("capacity", c.getCapacity())
                .append("enrolledCount", c.getEnrolledCount()));
        return courseCollection.updateOne(Filters.eq("_id", c.getId()), update).getModifiedCount() > 0;
    }

    public boolean incrementEnrollment(String courseId) {
        return courseCollection.updateOne(
                Filters.and(
                        Filters.eq("_id", courseId),
                        new Document("$expr", new Document("$lt", List.of("$enrolledCount", "$capacity")))
                ),
                new Document("$inc", new Document("enrolledCount", 1))
        ).getModifiedCount() > 0;
    }

    public boolean decrementEnrollment(String courseId) {
        return courseCollection.updateOne(
                Filters.and(
                        Filters.eq("_id", courseId),
                        Filters.gt("enrolledCount", 0)
                ),
                new Document("$inc", new Document("enrolledCount", -1))
        ).getModifiedCount() > 0;
    }

    public boolean delete(String id) {
        return courseCollection.deleteOne(Filters.eq("_id", id)).getDeletedCount() > 0;
    }

    private Course fromDocument(Document d) {
        Course c = new Course(
                d.getString("_id"),
                d.getString("name"),
                d.getString("instructor"),
                d.getInteger("credits", 0),
                d.getInteger("capacity", 0)
        );
        c.setEnrolledCount(d.getInteger("enrolledCount", 0));
        return c;
    }
}
