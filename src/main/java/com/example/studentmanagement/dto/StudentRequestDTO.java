package com.example.studentmanagement.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class StudentRequestDTO {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email format")
    private String email;

    @NotBlank(message = "Course cannot be blank")
    private String course;

    @NotNull(message = "Age is required")
    @Min(value = 5, message = "Age must be at least 5")
    @Max(value = 100, message = "Age cannot exceed 100")
    private Integer age;
}
