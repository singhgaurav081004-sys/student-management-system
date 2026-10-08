package com.studentmanagement.repository;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.studentmanagement.model.Admin;
import com.studentmanagement.util.MongoConnection;
import org.bson.Document;

import java.util.UUID;

public class AdminRepository {
    private final MongoCollection<Document> adminCollection;

    public AdminRepository() {
        MongoDatabase database = MongoConnection.getDatabase();
        this.adminCollection = database.getCollection("admins");
    }

    public void create(Admin admin) {
        Document doc = new Document("_id", admin.getId())
                .append("name", admin.getName())
                .append("email", admin.getEmail())
                .append("password", admin.getPassword());
        adminCollection.insertOne(doc);
    }

    public Admin findByEmail(String email) {
        Document d = adminCollection.find(Filters.eq("email", email)).first();
        return d == null ? null : fromDocument(d);
    }

    public void createIfAbsent(String name, String email, String password) {
        if (findByEmail(email) == null) {
            create(new Admin(UUID.randomUUID().toString(), name, email, password));
        }
    }

    private Admin fromDocument(Document d) {
        return new Admin(
                d.getString("_id"),
                d.getString("name"),
                d.getString("email"),
                d.getString("password")
        );
    }
}
