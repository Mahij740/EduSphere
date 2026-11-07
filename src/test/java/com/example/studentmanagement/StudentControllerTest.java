package com.example.studentmanagement;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Unauthenticated request to /api/students should return 401 Unauthorized JSON")
    void testUnauthenticatedApiAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("HTTP Basic authenticated admin request to /api/students should return 200 OK")
    void testBasicAuthAdminCanAccessApi() throws Exception {
        mockMvc.perform(get("/api/students").with(httpBasic("admin", "admin123")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public access to /login should return 200 OK")
    void testPublicAccessToLogin() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk());
    }
}
