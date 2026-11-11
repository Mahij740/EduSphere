package com.example.studentmanagement.dto;

import com.example.studentmanagement.entity.Student;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class StudentResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String course;
    private Integer age;

    public static StudentResponseDTO fromEntity(Student student) {
        if (student == null) {
            return null;
        }
        return StudentResponseDTO.builder()
                .id(student.getId())
                .name(student.getName())
                .email(student.getEmail())
                .course(student.getCourse())
                .age(student.getAge())
                .build();
    }
}

