package com.studentmanagement.model;

public class Admin extends User {
    public Admin() {
        super();
    }

    public Admin(String id, String name, String email, String password) {
        super(id, name, email, password);
    }

    @Override
    public String toString() {
        return "Admin{id='" + id + "', name='" + name + "', email='" + email + "'}";
    }
}
