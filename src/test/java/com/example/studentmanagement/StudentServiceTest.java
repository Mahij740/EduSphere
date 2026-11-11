package com.example.studentmanagement;


import com.example.studentmanagement.dto.StudentRequestDTO;
import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.exception.DuplicateEmailException;
import com.example.studentmanagement.exception.StudentNotFoundException;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class StudentServiceTest {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    @BeforeEach
    void cleanUp() {
        studentRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create student successfully")
    void testCreateStudentSuccess() {
        StudentRequestDTO request = new StudentRequestDTO("Alice Walker", "alice.w@example.com", "Computer Science", 21);
        Student created = studentService.createStudent(request);

        assertNotNull(created.getId());
        assertEquals("Alice Walker", created.getName());
        assertEquals("alice.w@example.com", created.getEmail());
        assertEquals("Computer Science", created.getCourse());
        assertEquals(21, created.getAge());
    }

    @Test
    @DisplayName("Should throw DuplicateEmailException when creating student with duplicate email")
    void testCreateStudentDuplicateEmail() {
        StudentRequestDTO request1 = new StudentRequestDTO("Student One", "same@example.com", "Physics", 20);
        studentService.createStudent(request1);

        StudentRequestDTO request2 = new StudentRequestDTO("Student Two", "same@example.com", "Math", 22);
        assertThrows(DuplicateEmailException.class, () -> studentService.createStudent(request2));
    }

    @Test
    @DisplayName("Should retrieve student by ID")
    void testGetStudentById() {
        StudentRequestDTO request = new StudentRequestDTO("Bob Martin", "bob.m@example.com", "Data Science", 23);
        Student created = studentService.createStudent(request);

        Student found = studentService.getStudentById(created.getId());
        assertEquals(created.getId(), found.getId());
        assertEquals("Bob Martin", found.getName());
    }

    @Test
    @DisplayName("Should throw StudentNotFoundException for non-existent ID")
    void testGetStudentByIdNotFound() {
        assertThrows(StudentNotFoundException.class, () -> studentService.getStudentById(99999L));
    }

    @Test
    @DisplayName("Should update student successfully")
    void testUpdateStudentSuccess() {
        StudentRequestDTO request = new StudentRequestDTO("Charlie Brown", "charlie@example.com", "Arts", 19);
        Student created = studentService.createStudent(request);

        StudentRequestDTO updateRequest = new StudentRequestDTO("Charles Brown", "charles.b@example.com", "Graphic Design", 20);
        Student updated = studentService.updateStudent(created.getId(), updateRequest);

        assertEquals("Charles Brown", updated.getName());
        assertEquals("charles.b@example.com", updated.getEmail());
        assertEquals("Graphic Design", updated.getCourse());
        assertEquals(20, updated.getAge());
    }

    @Test
    @DisplayName("Should delete student successfully")
    void testDeleteStudentSuccess() {
        StudentRequestDTO request = new StudentRequestDTO("To Delete", "delete.me@example.com", "Biology", 22);
        Student created = studentService.createStudent(request);

        studentService.deleteStudent(created.getId());
        assertThrows(StudentNotFoundException.class, () -> studentService.getStudentById(created.getId()));
    }

    @Test
    @DisplayName("Should filter students by course")
    void testGetStudentsByCourse() {
        studentService.createStudent(new StudentRequestDTO("Dev A", "deva@example.com", "Computer Science", 21));
        studentService.createStudent(new StudentRequestDTO("Dev B", "devb@example.com", "Computer Science", 22));
        studentService.createStudent(new StudentRequestDTO("Dev C", "devc@example.com", "Cybersecurity", 20));

        List<Student> csStudents = studentService.getStudentsByCourse("Computer Science");
        assertEquals(2, csStudents.size());
    }
}
