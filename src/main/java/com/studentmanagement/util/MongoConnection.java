package com.studentmanagement.util;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

public final class MongoConnection {
    private static MongoClient mongoClient;
    private static MongoDatabase database;

    private MongoConnection() {
        // Prevent external instantiation.
    }

    public static synchronized MongoDatabase getDatabase() {
        if (database == null) {
            String mongoUri = System.getenv("MONGO_URI");
            String dbName = System.getenv().getOrDefault("MONGO_DATABASE", "student_management");

            if (mongoUri == null || mongoUri.isBlank()) {
                throw new IllegalStateException(
                    "MONGO_URI environment variable is not set. Please set MONGO_URI before running."
                );
            }

            mongoClient = MongoClients.create(mongoUri);
            database = mongoClient.getDatabase(dbName);
        }
        return database;
    }

    public static synchronized void closeConnection() {
        if (mongoClient != null) {
            mongoClient.close();
            mongoClient = null;
            database = null;
        }
    }

    public static synchronized void close() {
        closeConnection();
    }
}
