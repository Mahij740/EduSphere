package com.example.studentmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "students", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email", name = "uk_student_email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email format")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Course cannot be blank")
    @Column(nullable = false, length = 100)
    private String course;

    @NotNull(message = "Age cannot be null")
    @Min(value = 5, message = "Age must be at least 5")
    @Max(value = 100, message = "Age cannot exceed 100")
    @Column(nullable = false)
    private Integer age;

    // Explicit constructors for compatibility
    public Student(String name, String email, String course, Integer age) {
        this.name = name;
        this.email = email;
        this.course = course;
        this.age = age;
    }
}
