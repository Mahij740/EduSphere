package com.example.studentmanagement.exception;

public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("A student with email '" + email + "' already exists");
    }
}
