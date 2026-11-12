package com.example.studentmanagement.config;

import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final StudentRepository studentRepository;

    @Override
    public void run(String... args) {
        if (studentRepository.count() == 0) {
            log.info("Populating database with realistic sample students...");

            List<Student> sampleStudents = List.of(
                Student.builder().name("Alex Chen").email("alex.chen@example.com").course("Computer Science").age(21).build(),
                Student.builder().name("Sophia Rodriguez").email("sophia.rodriguez@example.com").course("Information Technology").age(22).build(),
                Student.builder().name("Liam Johnson").email("liam.johnson@example.com").course("Mechanical Engineering").age(20).build(),
                Student.builder().name("Emma Watson").email("emma.watson@example.com").course("Civil Engineering").age(23).build(),
                Student.builder().name("Noah Patel").email("noah.patel@example.com").course("Electrical Engineering").age(19).build(),
                Student.builder().name("Olivia Kim").email("olivia.kim@example.com").course("Business Administration").age(22).build(),
                Student.builder().name("Ethan Davis").email("ethan.davis@example.com").course("Commerce").age(24).build(),
                Student.builder().name("Ava Martinez").email("ava.martinez@example.com").course("Mathematics").age(21).build(),
                Student.builder().name("Lucas Miller").email("lucas.miller@example.com").course("Computer Science").age(25).build(),
                Student.builder().name("Mia Taylor").email("mia.taylor@example.com").course("Information Technology").age(20).build()
            );

            studentRepository.saveAll(sampleStudents);
            log.info("Successfully seeded {} sample students into the database.", sampleStudents.size());
        } else {
            log.info("Database already contains {} students. Skipping data seed.", studentRepository.count());
        }
    }
}


