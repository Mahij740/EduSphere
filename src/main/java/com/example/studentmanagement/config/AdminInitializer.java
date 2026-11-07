package com.example.studentmanagement.config;

import com.example.studentmanagement.entity.Admin;
import com.example.studentmanagement.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_USERNAME:admin}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        String effectiveUsername = (adminUsername != null && !adminUsername.isBlank()) ? adminUsername.trim() : "admin";
        String effectivePassword = (adminPassword != null && !adminPassword.isBlank()) ? adminPassword.trim() : "admin123";

        Optional<Admin> existingAdminOpt = adminRepository.findByUsername(effectiveUsername);

        if (existingAdminOpt.isEmpty()) {
            log.info("Creating default administrator account '{}'", effectiveUsername);
            Admin newAdmin = Admin.builder()
                    .username(effectiveUsername)
                    .password(passwordEncoder.encode(effectivePassword))
                    .build();
            adminRepository.save(newAdmin);
            log.info("Administrator account '{}' initialized successfully.", effectiveUsername);
        } else {
            Admin admin = existingAdminOpt.get();
            // Environment-based password reset: if the environment password doesn't match stored hash, update it
            if (!passwordEncoder.matches(effectivePassword, admin.getPassword())) {
                log.info("Environment password change detected for '{}'. Updating stored BCrypt password hash...", effectiveUsername);
                admin.setPassword(passwordEncoder.encode(effectivePassword));
                adminRepository.save(admin);
                log.info("Administrator password updated successfully from environment variable.");
            } else {
                log.info("Administrator account '{}' verified.", effectiveUsername);
            }
        }
    }
}
