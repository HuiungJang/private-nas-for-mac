package com.manas.backend.context.auth.infrastructure.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.manas.backend.context.auth.application.port.in.CreateUserCommand;
import com.manas.backend.context.auth.application.port.in.CreateUserUseCase;
import com.manas.backend.context.auth.application.port.in.ListUsersUseCase;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.auth.infrastructure.web.dto.CreateUserRequest;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    private MockMvc mockMvc;

    @Mock

    private ListUsersUseCase listUsersUseCase;

    @Mock

    private CreateUserUseCase createUserUseCase;

    private final ObjectMapper objectMapper = new ObjectMapper();



    @BeforeEach
    void setUp() {

        AdminUserController controller = new AdminUserController(listUsersUseCase, createUserUseCase);

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

    }

    @Test

    @DisplayName("Should return list of users when authorized")

    @WithMockUser(roles = "ADMIN")

        // Note: Standalone setup ignores Spring Security, so this annotation is illustrative here

        // unless we integrate SecurityContext.

        // For standalone unit test of Controller logic, we assume Security is handled by FilterChain.

        // To test security rules, we'd need WebMvcTest or manual SecurityContext setting.

    void shouldListUsers() throws Exception {

        // Given

        User admin = User.create("admin", Password.of("hash"), Set.of(Role.ADMIN));

        when(listUsersUseCase.listAllUsers()).thenReturn(List.of(admin));

        // When/Then

        mockMvc.perform(get("/api/admin/users")

                        .contentType(MediaType.APPLICATION_JSON))

                .andExpect(status().isOk())

                .andExpect(jsonPath("$[0].username").value("admin"))

                .andExpect(jsonPath("$[0].roles[0]").value("ADMIN"));

    }

    @Test

    @DisplayName("Should create user successfully")
    void shouldCreateUser() throws Exception {

        // Given

        CreateUserRequest request = new CreateUserRequest("newuser", "password", Set.of(Role.USER));

        String json = objectMapper.writeValueAsString(request);

        // When/Then

        mockMvc.perform(post("/api/admin/users")

                        .contentType(MediaType.APPLICATION_JSON)

                        .content(json))

                .andExpect(status().isCreated());

        verify(createUserUseCase).createUser(any(CreateUserCommand.class));

    }

}


