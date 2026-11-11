package com.example.studentmanagement.repository;

import com.example.studentmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Student> findByCourseIgnoreCase(String course);

    Optional<Student> findByEmail(String email);

    @Query("SELECT DISTINCT s.course FROM Student s ORDER BY s.course ASC")
    List<String> findDistinctCourses();
}


