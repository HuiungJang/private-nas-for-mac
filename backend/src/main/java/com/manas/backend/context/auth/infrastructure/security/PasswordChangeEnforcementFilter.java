package com.manas.backend.context.auth.infrastructure.security;

import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.domain.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordChangeEnforcementFilter extends OncePerRequestFilter {

    private static final Set<String> ALLOWED_PATHS_WHEN_PASSWORD_CHANGE_REQUIRED = Set.of(
            "/api/auth/change-password",
            "/error"
    );

    private final LoadUserPort loadUserPort;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        String username = authentication.getName();
        String path = request.getRequestURI();

        User user = loadUserPort.loadUserByUsername(username).orElse(null);
        if (user != null && user.mustChangePassword() && !ALLOWED_PATHS_WHEN_PASSWORD_CHANGE_REQUIRED.contains(path)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"title\":\"Password Change Required\",\"status\":403,\"detail\":\"You must change your password before accessing other resources.\"}");
            log.warn("Blocked request for user={} due to required password change, path={}", username, path);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
