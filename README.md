# EduSphere - Student Management System

EduSphere is a robust, full-stack Student Management System built with **Spring Boot 4.1.2 (Java 21)**, **Spring Data JPA / Hibernate**, **Spring Security**, and **MySQL**, featuring a modern single-port responsive web dashboard crafted with vanilla HTML5, CSS3, and JavaScript.

---

## 🌟 Key Features

- **Secured RESTful API**: Full CRUD operations for student records with Bean Validation, custom exception handling, and consistent JSON error formats.
- **Admin Authentication**:
  - Session-based form login at `/login` with an elegant, responsive custom login UI.
  - HTTP Basic Authentication enabled on `/api/**` for seamless Postman / CLI automation.
  - Custom JSON entry point returning `401 Unauthorized` for secured API endpoints (no redirects).
  - Environment-based admin credentials initialization and password reset.
- **Modern Responsive Dashboard**:
  - Dark-mode charcoal aesthetic (`#121212`) accented with glowing purple tones (`#8b5cf6`, `#a78bfa`).
  - Welcome metrics: Real-time counts of enrolled students, active departments, and average age.
  - Interactive Student Directory: Live debounced search, multi-column sorting (ID, Name, Course, Age), course filters, and configurable pagination (5/10/20 per page).
  - Searchable Course Selector: Presets for 8 core engineering and business disciplines, instant addition of custom courses on the fly, and database synchronization.
  - Modal workflows: In-place edit modal with validation, and delete confirmation dialog naming the student.
  - Floating toast notifications for feedback on all CRUD operations.
  - Mobile drawer navigation with smooth hamburger animations and backdrop blur.

---

## 🛠 Tech Stack

- **Backend**: Java 21, Spring Boot 4.1.2, Spring Security, Spring Data JPA, Hibernate, Lombok
- **Database**: MySQL 8.0+ (with automated schema update and data seeding)
- **Frontend**: Vanilla HTML5, CSS3 Variables & Flex/Grid, Vanilla JavaScript (Fetch API with `credentials: 'include'`)
- **Build Tool**: Apache Maven Wrapper (`mvnw` / `mvnw.cmd`)
- **Testing**: JUnit 5, Mockito, Spring Security Test, Spring Boot Test (H2 in-memory test database)

---

## 📋 Prerequisites

- **Java Development Kit (JDK)**: Version 21 or higher
- **MySQL Server**: Version 8.0 or higher running on port `3306`

---

## ⚙️ Environment Variables & Configuration

EduSphere uses sensible defaults for local development while allowing configuration via environment variables:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DB_USERNAME` | MySQL database username | `root` |
| `DB_PASSWORD` | MySQL database password | *(empty)* |
| `ADMIN_USERNAME` | Administrator login username | `admin` |
| `ADMIN_PASSWORD` | Administrator login password | `admin123` |

### Environment-Based Admin Password Reset
If you forget the administrator password or need to rotate credentials:
1. Update the `ADMIN_PASSWORD` environment variable (e.g., in your terminal or `.env`).
2. Restart the Spring Boot application.
3. On startup, `AdminInitializer` compares the environment password against the stored BCrypt hash in the database and updates the hash automatically.

---

## 🚀 How to Run the Application

### Option A: Using Local MySQL Database

1. Ensure MySQL service is running on port 3306.
2. In PowerShell or Command Prompt, set your database password and launch the application:
   ```powershell
   $env:DB_PASSWORD="your_mysql_password"
   .\mvnw.cmd spring-boot:run
   ```
   *(On Linux/macOS: `DB_PASSWORD="your_mysql_password" ./mvnw spring-boot:run`)*

### Option B: Quick Development / Demo Mode (H2 Database)

To run without configuring MySQL:
```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

Once started:
- Open your browser to: **[http://localhost:8080](http://localhost:8080)**
- Sign in with:
  - **Username**: `admin`
  - **Password**: `admin123`

---

## 📡 REST API Reference

All `/api/**` endpoints require authentication (Session Cookie or HTTP Basic Auth header).

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | Retrieve all student records | `200 OK` |
| `GET` | `/api/students/{id}` | Retrieve single student by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/students` | Create new student | `201 Created` / `400 Bad Request` / `409 Conflict` |
| `PUT` | `/api/students/{id}` | Update existing student | `200 OK` / `400 Bad Request` / `404 Not Found` / `409 Conflict` |
| `DELETE` | `/api/students/{id}` | Delete student record | `204 No Content` / `404 Not Found` |
| `GET` | `/api/students/course/{course}` | Filter students by course | `200 OK` |
| `GET` | `/api/students/courses` | List all distinct courses | `200 OK` |

### Sample JSON Payload (POST / PUT)
```json
{
  "name": "Alexandra Vance",
  "email": "alexandra.vance@example.com",
  "course": "Computer Science",
  "age": 21
}
```

---

## 🧪 Testing

Run all unit, integration, and security tests:
```powershell
.\mvnw.cmd test
```

---

## 📬 Postman Collection

A complete Postman test collection is located at:
`postman/EduSphere.postman_collection.json`

### How to Import & Use:
1. Open Postman, click **Import**, and select `postman/EduSphere.postman_collection.json`.
2. The collection uses variables:
   - `baseUrl`: `http://localhost:8080`
   - `adminUsername`: `admin`
   - `adminPassword`: `admin123`
3. It includes requests for all 6 core endpoints, courses list, and error scenarios (`401 Unauthorized`, `404 Not Found`, `400 Validation`, `409 Conflict`).

### Postman Screenshots Placeholder
<!-- Add your Postman test run execution screenshots here -->
*(Screenshots can be added here showing test results for GET, POST, PUT, DELETE, and 401 response)*
