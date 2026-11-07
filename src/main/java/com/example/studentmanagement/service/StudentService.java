package com.example.studentmanagement.service;

import com.example.studentmanagement.dto.StudentRequestDTO;
import com.example.studentmanagement.entity.Student;

import java.util.List;

public interface StudentService {

    List<Student> getAllStudents();

    Student getStudentById(Long id);

    Student createStudent(StudentRequestDTO request);

    Student updateStudent(Long id, StudentRequestDTO request);

    void deleteStudent(Long id);

    List<Student> getStudentsByCourse(String course);

    List<String> getAllCourses();
}
