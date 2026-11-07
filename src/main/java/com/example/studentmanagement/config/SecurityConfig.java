package com.example.studentmanagement.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Disabled CSRF for stateless Postman/curl testing and direct fetch calls from the same-origin single-port frontend
        http.csrf(csrf -> csrf.disable());

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/login",
                        "/login.html",
                        "/css/**",
                        "/js/**",
                        "/favicon.ico",
                        "/error"
                ).permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
        );

        // Form login configuration for browser dashboard
        http.formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/", true)
                .failureUrl("/login?error=true")
                .permitAll()
        );

        // Enable HTTP Basic authentication for Postman / curl / API testing
        http.httpBasic(Customizer.withDefaults());

        // Logout handling
        http.logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
        );

        // Return 401 JSON for /api/** calls instead of redirecting; redirect other unauthenticated browser requests to /login
        AuthenticationEntryPoint apiAuthEntryPoint = (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            String json = String.format(
                    "{\"timestamp\":\"%s\",\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required to access API: %s\",\"path\":\"%s\"}",
                    LocalDateTime.now(),
                    authException.getMessage() != null ? authException.getMessage().replace("\"", "'") : "Unauthorized",
                    request.getRequestURI()
            );
            response.getWriter().write(json);
        };

        http.exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                        apiAuthEntryPoint,
                        request -> request.getRequestURI() != null && request.getRequestURI().startsWith("/api")
                )
        );

        return http.build();
    }
}
