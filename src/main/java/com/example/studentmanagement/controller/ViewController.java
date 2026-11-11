package com.example.studentmanagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/students")
    public String students() {
        return "forward:/students.html";
    }

    @GetMapping("/students/add")
    public String addStudent() {
        return "forward:/add-student.html";
    }

    @GetMapping("/login")
    public String login() {
        return "forward:/login.html";
    }
}


