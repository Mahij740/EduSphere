package com.example.studentmanagement.service.impl;

import com.example.studentmanagement.dto.StudentRequestDTO;
import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.exception.DuplicateEmailException;
import com.example.studentmanagement.exception.StudentNotFoundException;
import com.example.studentmanagement.repository.StudentRepository;
import com.example.studentmanagement.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    @Override
    public Student createStudent(StudentRequestDTO request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (studentRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException(request.getEmail());
        }

        Student student = Student.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .course(request.getCourse().trim())
                .age(request.getAge())
                .build();

        return studentRepository.save(student);
    }

    @Override
    public Student updateStudent(Long id, StudentRequestDTO request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (studentRepository.existsByEmailAndIdNot(normalizedEmail, id)) {
            throw new DuplicateEmailException(request.getEmail());
        }

        student.setName(request.getName().trim());
        student.setEmail(normalizedEmail);
        student.setCourse(request.getCourse().trim());
        student.setAge(request.getAge());

        return studentRepository.save(student);
    }

    
    @Override
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new StudentNotFoundException(id);
        }
        studentRepository.deleteById(id);
    }

    
    @Override
    @Transactional(readOnly = true)
    public List<Student> getStudentsByCourse(String course) {
        return studentRepository.findByCourseIgnoreCase(course.trim());
    }

    
    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCourses() {
        return studentRepository.findDistinctCourses();
    }
}
