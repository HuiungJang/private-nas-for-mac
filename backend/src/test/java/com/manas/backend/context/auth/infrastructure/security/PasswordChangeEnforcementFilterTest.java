package com.manas.backend.context.auth.infrastructure.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import jakarta.servlet.FilterChain;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class PasswordChangeEnforcementFilterTest {

    @Mock
    private LoadUserPort loadUserPort;

    private PasswordChangeEnforcementFilter filter;

    @BeforeEach
    void setUp() {
        filter = new PasswordChangeEnforcementFilter(loadUserPort);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("mustChangePassword=true 사용자의 일반 API 요청을 차단한다")
    void shouldBlockNonAllowedPathWhenPasswordChangeRequired() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/users");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", null, List.of())
        );

        User user = User.createBootstrapAdmin("admin", Password.of("hash"), Set.of(Role.ADMIN));
        when(loadUserPort.loadUserByUsername("admin")).thenReturn(Optional.of(user));

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("Password Change Required");
    }

    @Test
    @DisplayName("mustChangePassword=true 사용자도 change-password API는 허용한다")
    void shouldAllowChangePasswordPathWhenPasswordChangeRequired() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/change-password");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", null, List.of())
        );

        User user = User.createBootstrapAdmin("admin", Password.of("hash"), Set.of(Role.ADMIN));
        when(loadUserPort.loadUserByUsername("admin")).thenReturn(Optional.of(user));

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    @DisplayName("mustChangePassword=false 사용자의 일반 API 요청은 허용한다")
    void shouldAllowWhenPasswordChangeNotRequired() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/users");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", null, List.of())
        );

        User user = User.create("admin", Password.of("hash"), Set.of(Role.ADMIN));
        when(loadUserPort.loadUserByUsername("admin")).thenReturn(Optional.of(user));

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }
}
