package com.studentmanagement.web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import com.studentmanagement.exception.CourseFullException;
import com.studentmanagement.exception.StudentNotFoundException;
import com.studentmanagement.exception.ValidationException;
import com.studentmanagement.model.Admin;
import com.studentmanagement.model.Course;
import com.studentmanagement.model.Enrollment;
import com.studentmanagement.model.Student;
import com.studentmanagement.repository.AdminRepository;
import com.studentmanagement.repository.CourseRepository;
import com.studentmanagement.repository.EnrollmentRepository;
import com.studentmanagement.repository.StudentRepository;
import com.studentmanagement.service.CourseService;
import com.studentmanagement.service.EnrollmentService;
import com.studentmanagement.service.StudentService;
import org.bson.Document;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

public class WebServer {
    private static final int DEFAULT_PORT = 8080;
    private final int port;
    private HttpServer server;

    private StudentService studentService;
    private CourseService courseService;
    private EnrollmentService enrollmentService;
    private volatile boolean isInMemoryMode = true;
    private volatile String databaseStatusMessage = "In-Memory / Atlas Fallback";

    // Resilient In-Memory Fallback Cache
    private final Map<String, Student> memStudents = new ConcurrentHashMap<>();
    private final Map<String, Course> memCourses = new ConcurrentHashMap<>();
    private final Map<String, Enrollment> memEnrollments = new ConcurrentHashMap<>();

    public WebServer(int port) {
        this.port = port;
        seedDemoDataInMemory();
        // Probe MongoDB Atlas asynchronously to avoid any startup delay
        probeMongoAtlasAsync();
    }

    private void probeMongoAtlasAsync() {
        Thread thread = new Thread(() -> {
            try {
                StudentRepository sRepo = new StudentRepository();
                CourseRepository cRepo = new CourseRepository();
                EnrollmentRepository eRepo = new EnrollmentRepository();
                AdminRepository aRepo = new AdminRepository();

                this.studentService = new StudentService(sRepo);
                this.courseService = new CourseService(cRepo);
                this.enrollmentService = new EnrollmentService(eRepo, studentService, courseService);

                // Test write/read
                aRepo.createIfAbsent("System Administrator", "admin@srm.edu", "admin123");
                this.isInMemoryMode = false;
                this.databaseStatusMessage = "MongoDB Atlas Cloud";
                System.out.println("[DB] MongoDB Atlas connection verified and active.");
            } catch (Exception ex) {
                this.isInMemoryMode = true;
                this.databaseStatusMessage = "In-Memory / Atlas Fallback";
                System.out.println("[DB INFO] Running in-memory database store (Atlas cluster unready or IP not in access list).");
            }
        });
        thread.setDaemon(true);
        thread.setName("MongoAtlasProbe");
        thread.start();
    }

    public synchronized void start() throws IOException {
        int activePort = port;
        try {
            server = HttpServer.create(new InetSocketAddress(activePort), 0);
        } catch (IOException e) {
            activePort = 8081;
            server = HttpServer.create(new InetSocketAddress(activePort), 0);
        }

        server.createContext("/", new StaticFileHandler());
        server.createContext("/api/dashboard", new DashboardHandler());
        server.createContext("/api/students", new StudentsHandler());
        server.createContext("/api/courses", new CoursesHandler());
        server.createContext("/api/enrollments", new EnrollmentsHandler());
        server.createContext("/api/seed", new SeedDataHandler());

        server.setExecutor(Executors.newCachedThreadPool());
        server.start();

        System.out.println("=================================================================");
        System.out.println(" 🌐 STUDENT MANAGEMENT SYSTEM - WEB EDITION");
        System.out.println(" 🚀 Live Web Server deployed on: http://localhost:" + activePort);
        System.out.println(" 📂 Open your browser and navigate to: http://localhost:" + activePort);
        System.out.println("=================================================================");
    }

    public synchronized void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    public static void main(String[] args) throws IOException {
        int p = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                p = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {}
        }
        WebServer webServer = new WebServer(p);
        webServer.start();
    }

    private void seedDemoDataInMemory() {
        Course c1 = new Course("CS101", "Data Structures & Algorithms", "Dr. A. Sharma", 4, 60);
        c1.setEnrolledCount(1);
        memCourses.put(c1.getId(), c1);

        Course c2 = new Course("CS202", "Database Management Systems", "Prof. R. Patel", 4, 45);
        c2.setEnrolledCount(1);
        memCourses.put(c2.getId(), c2);

        Course c3 = new Course("CS303", "Machine Learning & AI", "Dr. S. Mukherjee", 3, 30);
        c3.setEnrolledCount(0);
        memCourses.put(c3.getId(), c3);

        Course c4 = new Course("CS404", "Cloud Computing & DevOps", "Prof. K. Iyer", 3, 40);
        c4.setEnrolledCount(0);
        memCourses.put(c4.getId(), c4);

        Student s1 = new Student("s-101", "Gaurav Singh", "gaurav@srm.edu", "pass123", "RA2511026001", "CSE(AIML)", 2);
        s1.addCourse("CS101");
        memStudents.put(s1.getId(), s1);

        Student s2 = new Student("s-102", "Priya Sharma", "priya@srm.edu", "pass123", "RA2511026002", "CSE", 3);
        s2.addCourse("CS202");
        memStudents.put(s2.getId(), s2);

        Student s3 = new Student("s-103", "Aman Verma", "aman@srm.edu", "pass123", "RA2511026003", "Information Technology", 1);
        memStudents.put(s3.getId(), s3);

        Enrollment e1 = new Enrollment("e-101", s1.getId(), "CS101", LocalDate.now().minusDays(15), "A", "ACTIVE");
        memEnrollments.put(e1.getId(), e1);

        Enrollment e2 = new Enrollment("e-102", s2.getId(), "CS202", LocalDate.now().minusDays(10), "B", "ACTIVE");
        memEnrollments.put(e2.getId(), e2);
    }

    // --- HTTP HANDLERS ---

    private class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            if (path.startsWith("/")) path = path.substring(1);

            File localFile = new File("src/main/resources/static/" + path);
            byte[] content = null;
            String contentType = getMimeType(path);

            if (localFile.exists() && !localFile.isDirectory()) {
                content = Files.readAllBytes(localFile.toPath());
            } else {
                InputStream is = getClass().getResourceAsStream("/static/" + path);
                if (is != null) {
                    content = is.readAllBytes();
                }
            }

            if (content == null) {
                File indexFile = new File("src/main/resources/static/index.html");
                if (indexFile.exists()) {
                    content = Files.readAllBytes(indexFile.toPath());
                    contentType = "text/html; charset=UTF-8";
                }
            }

            if (content != null) {
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
                exchange.sendResponseHeaders(200, content.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(content);
                }
            } else {
                String notFound = "404 Not Found: " + path;
                exchange.sendResponseHeaders(404, notFound.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(notFound.getBytes(StandardCharsets.UTF_8));
                }
            }
        }
    }

    private class DashboardHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCors(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            int studentCount;
            int courseCount;
            int enrollmentCount;
            int activeEnrollments;

            if (isInMemoryMode) {
                studentCount = memStudents.size();
                courseCount = memCourses.size();
                enrollmentCount = memEnrollments.size();
                activeEnrollments = (int) memEnrollments.values().stream()
                        .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();
            } else {
                try {
                    List<Student> sList = studentService.getAllStudents();
                    List<Course> cList = courseService.getAllCourses();
                    List<Enrollment> eList = enrollmentService.getAll();
                    studentCount = sList.size();
                    courseCount = cList.size();
                    enrollmentCount = eList.size();
                    activeEnrollments = (int) eList.stream()
                            .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();
                } catch (Exception ex) {
                    studentCount = memStudents.size();
                    courseCount = memCourses.size();
                    enrollmentCount = memEnrollments.size();
                    activeEnrollments = (int) memEnrollments.values().stream()
                            .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();
                }
            }

            Document doc = new Document()
                    .append("studentCount", studentCount)
                    .append("courseCount", courseCount)
                    .append("enrollmentCount", enrollmentCount)
                    .append("activeEnrollments", activeEnrollments)
                    .append("databaseMode", databaseStatusMessage)
                    .append("status", "System Online");

            sendJson(exchange, 200, doc.toJson());
        }
    }

    private class StudentsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCors(exchange);
            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String id = extractId(path, "/api/students");

            try {
                if ("GET".equals(method)) {
                    if (id != null) {
                        Student s = getStudent(id);
                        if (s == null) {
                            sendJson(exchange, 404, errorJson("Student not found."));
                            return;
                        }
                        sendJson(exchange, 200, studentToJson(s));
                    } else {
                        List<Student> list = getAllStudents();
                        String query = exchange.getRequestURI().getQuery();
                        if (query != null && query.contains("search=")) {
                            String term = query.substring(query.indexOf("search=") + 7).toLowerCase();
                            term = URLDecoder.decode(term, StandardCharsets.UTF_8);
                            String finalTerm = term;
                            list = list.stream().filter(s ->
                                    s.getName().toLowerCase().contains(finalTerm) ||
                                    s.getRollNumber().toLowerCase().contains(finalTerm) ||
                                    s.getDepartment().toLowerCase().contains(finalTerm)
                            ).collect(Collectors.toList());
                        }
                        String jsonArray = "[" + list.stream().map(WebServer::studentToJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, jsonArray);
                    }
                } else if ("POST".equals(method)) {
                    String body = readBody(exchange);
                    Document doc = Document.parse(body);

                    String name = doc.getString("name");
                    String email = doc.getString("email");
                    String password = doc.getString("password");
                    String roll = doc.getString("rollNumber");
                    String dept = doc.getString("department");
                    Integer year = doc.getInteger("year", 1);

                    Student created = createStudent(name, email, password, roll, dept, year);
                    sendJson(exchange, 201, studentToJson(created));
                } else if ("PUT".equals(method)) {
                    if (id == null) {
                        sendJson(exchange, 400, errorJson("Student ID required."));
                        return;
                    }
                    String body = readBody(exchange);
                    Document doc = Document.parse(body);

                    Student existing = getStudent(id);
                    if (existing == null) {
                        sendJson(exchange, 404, errorJson("Student not found."));
                        return;
                    }

                    if (doc.containsKey("name")) existing.setName(doc.getString("name"));
                    if (doc.containsKey("email")) existing.setEmail(doc.getString("email"));
                    if (doc.containsKey("password") && !doc.getString("password").isBlank())
                        existing.setPassword(doc.getString("password"));
                    if (doc.containsKey("rollNumber")) existing.setRollNumber(doc.getString("rollNumber"));
                    if (doc.containsKey("department")) existing.setDepartment(doc.getString("department"));
                    if (doc.containsKey("year")) existing.setYear(doc.getInteger("year"));

                    updateStudent(existing);
                    sendJson(exchange, 200, studentToJson(existing));
                } else if ("DELETE".equals(method)) {
                    if (id == null) {
                        sendJson(exchange, 400, errorJson("Student ID required."));
                        return;
                    }
                    deleteStudent(id);
                    sendJson(exchange, 200, "{\"success\":true,\"message\":\"Student deleted.\"}");
                } else {
                    sendJson(exchange, 405, errorJson("Method Not Allowed"));
                }
            } catch (ValidationException | StudentNotFoundException ex) {
                sendJson(exchange, 400, errorJson(ex.getMessage()));
            } catch (Exception ex) {
                sendJson(exchange, 500, errorJson("Internal error: " + ex.getMessage()));
            }
        }
    }

    private class CoursesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCors(exchange);
            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String id = extractId(path, "/api/courses");

            try {
                if ("GET".equals(method)) {
                    if (id != null) {
                        Course c = getCourse(id);
                        if (c == null) {
                            sendJson(exchange, 404, errorJson("Course not found."));
                            return;
                        }
                        sendJson(exchange, 200, courseToJson(c));
                    } else {
                        List<Course> list = getAllCourses();
                        String jsonArray = "[" + list.stream().map(WebServer::courseToJson).collect(Collectors.joining(",")) + "]";
                        sendJson(exchange, 200, jsonArray);
                    }
                } else if ("POST".equals(method)) {
                    String body = readBody(exchange);
                    Document doc = Document.parse(body);

                    String courseId = doc.getString("id");
                    String name = doc.getString("name");
                    String instructor = doc.getString("instructor");
                    int credits = doc.getInteger("credits", 3);
                    int capacity = doc.getInteger("capacity", 50);

                    Course c = new Course(courseId, name, instructor, credits, capacity);
                    createCourse(c);
                    sendJson(exchange, 201, courseToJson(c));
                } else if ("PUT".equals(method)) {
                    if (id == null) {
                        sendJson(exchange, 400, errorJson("Course ID required."));
                        return;
                    }
                    String body = readBody(exchange);
                    Document doc = Document.parse(body);
                    Course c = getCourse(id);
                    if (c == null) {
                        sendJson(exchange, 404, errorJson("Course not found."));
                        return;
                    }
                    if (doc.containsKey("name")) c.setName(doc.getString("name"));
                    if (doc.containsKey("instructor")) c.setInstructor(doc.getString("instructor"));
                    if (doc.containsKey("credits")) c.setCredits(doc.getInteger("credits"));
                    if (doc.containsKey("capacity")) c.setCapacity(doc.getInteger("capacity"));

                    updateCourse(c);
                    sendJson(exchange, 200, courseToJson(c));
                } else if ("DELETE".equals(method)) {
                    if (id == null) {
                        sendJson(exchange, 400, errorJson("Course ID required."));
                        return;
                    }
                    deleteCourse(id);
                    sendJson(exchange, 200, "{\"success\":true,\"message\":\"Course deleted.\"}");
                } else {
                    sendJson(exchange, 405, errorJson("Method Not Allowed"));
                }
            } catch (ValidationException ex) {
                sendJson(exchange, 400, errorJson(ex.getMessage()));
            } catch (Exception ex) {
                sendJson(exchange, 500, errorJson("Internal error: " + ex.getMessage()));
            }
        }
    }

    private class EnrollmentsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCors(exchange);
            String method = exchange.getRequestMethod().toUpperCase();
            if ("OPTIONS".equals(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String id = extractId(path, "/api/enrollments");

            try {
                if ("GET".equals(method)) {
                    List<Enrollment> list = getAllEnrollments();
                    String jsonArray = "[" + list.stream().map(WebServer::enrollmentToJson).collect(Collectors.joining(",")) + "]";
                    sendJson(exchange, 200, jsonArray);
                } else if ("POST".equals(method)) {
                    String body = readBody(exchange);
                    Document doc = Document.parse(body);
                    String studentId = doc.getString("studentId");
                    String courseId = doc.getString("courseId");

                    Enrollment e = createEnrollment(studentId, courseId);
                    sendJson(exchange, 201, enrollmentToJson(e));
                } else if ("PATCH".equals(method) || "PUT".equals(method)) {
                    if (id == null) {
                        sendJson(exchange, 400, errorJson("Enrollment ID required."));
                        return;
                    }
                    String body = readBody(exchange);
                    Document doc = Document.parse(body);

                    if (doc.containsKey("grade")) {
                        updateEnrollmentGrade(id, doc.getString("grade"));
                    }
                    if (doc.containsKey("status")) {
                        updateEnrollmentStatus(id, doc.getString("status"));
                    }
                    Enrollment updated = getEnrollment(id);
                    sendJson(exchange, 200, enrollmentToJson(updated));
                } else {
                    sendJson(exchange, 405, errorJson("Method Not Allowed"));
                }
            } catch (CourseFullException | ValidationException | StudentNotFoundException ex) {
                sendJson(exchange, 400, errorJson(ex.getMessage()));
            } catch (Exception ex) {
                sendJson(exchange, 500, errorJson("Internal error: " + ex.getMessage()));
            }
        }
    }

    private class SeedDataHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            addCors(exchange);
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, errorJson("Method Not Allowed"));
                return;
            }
            seedDemoDataInMemory();
            sendJson(exchange, 200, "{\"success\":true,\"message\":\"Sample academic data successfully initialized.\"}");
        }
    }

    // --- REPOSITORY DELEGATES ---

    private List<Student> getAllStudents() {
        if (isInMemoryMode || studentService == null) {
            return new ArrayList<>(memStudents.values());
        }
        try {
            return studentService.getAllStudents();
        } catch (Exception e) {
            return new ArrayList<>(memStudents.values());
        }
    }

    private Student getStudent(String id) {
        if (isInMemoryMode || studentService == null) {
            return memStudents.get(id);
        }
        try {
            return studentService.getById(id);
        } catch (Exception e) {
            return memStudents.get(id);
        }
    }

    private Student createStudent(String name, String email, String password, String roll, String dept, int year) {
        if (isInMemoryMode || studentService == null) {
            if (name == null || name.isBlank() || email == null || email.isBlank() || roll == null || roll.isBlank()) {
                throw new ValidationException("All fields are required.");
            }
            for (Student s : memStudents.values()) {
                if (s.getRollNumber().equalsIgnoreCase(roll)) throw new ValidationException("Roll number already registered: " + roll);
                if (s.getEmail().equalsIgnoreCase(email)) throw new ValidationException("Email already registered: " + email);
            }
            Student s = new Student(UUID.randomUUID().toString(), name, email, password, roll, dept, year);
            memStudents.put(s.getId(), s);
            return s;
        }
        try {
            return studentService.addStudent(name, email, password, roll, dept, year);
        } catch (Exception e) {
            Student s = new Student(UUID.randomUUID().toString(), name, email, password, roll, dept, year);
            memStudents.put(s.getId(), s);
            return s;
        }
    }

    private void updateStudent(Student s) {
        if (isInMemoryMode || studentService == null) {
            memStudents.put(s.getId(), s);
            return;
        }
        try {
            studentService.updateStudent(s);
        } catch (Exception e) {
            memStudents.put(s.getId(), s);
        }
    }

    private void deleteStudent(String id) {
        if (isInMemoryMode || studentService == null) {
            memStudents.remove(id);
            return;
        }
        try {
            studentService.deleteStudent(id);
        } catch (Exception e) {
            memStudents.remove(id);
        }
    }

    private List<Course> getAllCourses() {
        if (isInMemoryMode || courseService == null) {
            return new ArrayList<>(memCourses.values());
        }
        try {
            return courseService.getAllCourses();
        } catch (Exception e) {
            return new ArrayList<>(memCourses.values());
        }
    }

    private Course getCourse(String id) {
        if (isInMemoryMode || courseService == null) {
            return memCourses.get(id);
        }
        try {
            return courseService.getCourse(id);
        } catch (Exception e) {
            return memCourses.get(id);
        }
    }

    private void createCourse(Course c) {
        if (isInMemoryMode || courseService == null) {
            if (memCourses.containsKey(c.getId())) {
                throw new ValidationException("Course ID already exists: " + c.getId());
            }
            memCourses.put(c.getId(), c);
            return;
        }
        try {
            courseService.addCourse(c);
        } catch (Exception e) {
            memCourses.put(c.getId(), c);
        }
    }

    private void updateCourse(Course c) {
        if (isInMemoryMode || courseService == null) {
            memCourses.put(c.getId(), c);
            return;
        }
        try {
            courseService.updateCourse(c);
        } catch (Exception e) {
            memCourses.put(c.getId(), c);
        }
    }

    private void deleteCourse(String id) {
        if (isInMemoryMode || courseService == null) {
            Course c = memCourses.get(id);
            if (c != null && c.getEnrolledCount() > 0) {
                throw new ValidationException("Cannot delete course with active enrollments (" + c.getEnrolledCount() + ").");
            }
            memCourses.remove(id);
            return;
        }
        try {
            courseService.deleteCourse(id);
        } catch (Exception e) {
            memCourses.remove(id);
        }
    }

    private List<Enrollment> getAllEnrollments() {
        if (isInMemoryMode || enrollmentService == null) {
            return new ArrayList<>(memEnrollments.values());
        }
        try {
            return enrollmentService.getAll();
        } catch (Exception e) {
            return new ArrayList<>(memEnrollments.values());
        }
    }

    private Enrollment getEnrollment(String id) {
        if (isInMemoryMode || enrollmentService == null) {
            return memEnrollments.get(id);
        }
        for (Enrollment e : getAllEnrollments()) {
            if (e.getId().equals(id)) return e;
        }
        return null;
    }

    private Enrollment createEnrollment(String studentId, String courseId) {
        if (isInMemoryMode || enrollmentService == null) {
            Student s = memStudents.get(studentId);
            Course c = memCourses.get(courseId);
            if (s == null) throw new StudentNotFoundException("Student not found.");
            if (c == null) throw new ValidationException("Course not found.");

            for (Enrollment e : memEnrollments.values()) {
                if (e.getStudentId().equals(studentId) && e.getCourseId().equals(courseId) && "ACTIVE".equals(e.getStatus())) {
                    throw new ValidationException("Student is already actively enrolled in this course.");
                }
            }
            if (!c.hasCapacity()) {
                throw new CourseFullException("Course capacity reached (" + c.getCapacity() + " seats full).");
            }

            c.setEnrolledCount(c.getEnrolledCount() + 1);
            s.addCourse(courseId);
            Enrollment enrollment = new Enrollment(UUID.randomUUID().toString(), studentId, courseId);
            memEnrollments.put(enrollment.getId(), enrollment);
            return enrollment;
        }
        try {
            return enrollmentService.enroll(studentId, courseId);
        } catch (Exception e) {
            return createEnrollment(studentId, courseId);
        }
    }

    private void updateEnrollmentGrade(String id, String grade) {
        if (isInMemoryMode || enrollmentService == null) {
            Enrollment e = memEnrollments.get(id);
            if (e != null) e.setGrade(grade.toUpperCase());
            return;
        }
        try {
            enrollmentService.assignGrade(id, grade);
        } catch (Exception e) {
            Enrollment ev = memEnrollments.get(id);
            if (ev != null) ev.setGrade(grade.toUpperCase());
        }
    }

    private void updateEnrollmentStatus(String id, String status) {
        if (isInMemoryMode || enrollmentService == null) {
            Enrollment e = memEnrollments.get(id);
            if (e != null) e.setStatus(status.toUpperCase());
            return;
        }
        try {
            enrollmentService.updateStatus(id, status);
        } catch (Exception e) {
            Enrollment ev = memEnrollments.get(id);
            if (ev != null) ev.setStatus(status.toUpperCase());
        }
    }

    // --- UTILITIES ---

    private static String studentToJson(Student s) {
        return new Document()
                .append("id", s.getId())
                .append("name", s.getName())
                .append("email", s.getEmail())
                .append("rollNumber", s.getRollNumber())
                .append("department", s.getDepartment())
                .append("year", s.getYear())
                .append("enrolledCourses", s.getEnrolledCourseIds() == null ? 0 : s.getEnrolledCourseIds().size())
                .append("enrolledCourseIds", s.getEnrolledCourseIds())
                .toJson();
    }

    private static String courseToJson(Course c) {
        return new Document()
                .append("id", c.getId())
                .append("name", c.getName())
                .append("instructor", c.getInstructor())
                .append("credits", c.getCredits())
                .append("capacity", c.getCapacity())
                .append("enrolledCount", c.getEnrolledCount())
                .append("hasCapacity", c.hasCapacity())
                .toJson();
    }

    private static String enrollmentToJson(Enrollment e) {
        return new Document()
                .append("id", e.getId())
                .append("studentId", e.getStudentId())
                .append("courseId", e.getCourseId())
                .append("enrollmentDate", e.getEnrollmentDate() != null ? e.getEnrollmentDate().toString() : "")
                .append("grade", e.getGrade())
                .append("status", e.getStatus())
                .toJson();
    }

    private static String errorJson(String msg) {
        return "{\"error\":" + Document.parse("{\"m\":\"" + msg.replace("\"", "\\\"") + "\"}").toJson().substring(5);
    }

    private static String extractId(String path, String base) {
        if (path.length() > base.length()) {
            String remainder = path.substring(base.length());
            if (remainder.startsWith("/")) remainder = remainder.substring(1);
            if (!remainder.isEmpty()) return remainder;
        }
        return null;
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void addCors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static String getMimeType(String file) {
        if (file.endsWith(".html")) return "text/html; charset=UTF-8";
        if (file.endsWith(".css")) return "text/css; charset=UTF-8";
        if (file.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (file.endsWith(".json")) return "application/json; charset=UTF-8";
        if (file.endsWith(".svg")) return "image/svg+xml";
        if (file.endsWith(".png")) return "image/png";
        if (file.endsWith(".ico")) return "image/x-icon";
        return "text/plain; charset=UTF-8";
    }
}
