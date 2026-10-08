package com.studentmanagement;

import com.mongodb.client.MongoDatabase;
import com.studentmanagement.util.MongoConnection;

public class MongoConnectionTest {
    public static void main(String[] args) {
        try {
            MongoDatabase database = MongoConnection.getDatabase();
            System.out.println("MongoDB connection successful!");
            System.out.println("Connected to database: " + database.getName());
        } catch (Exception e) {
            System.out.println("MongoDB connection failed.");
            System.out.println("Error: " + e.getMessage());
        } finally {
            MongoConnection.closeConnection();
        }
    }
}
