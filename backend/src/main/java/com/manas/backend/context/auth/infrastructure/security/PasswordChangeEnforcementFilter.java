package com.manas.backend.context.auth.infrastructure.security;

import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.domain.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordChangeEnforcementFilter extends OncePerRequestFilter {

    private static final List<RequestMatcher> ALLOWED_MATCHERS_WHEN_PASSWORD_CHANGE_REQUIRED = List.of(
            request -> "POST".equalsIgnoreCase(request.getMethod())
                    && "/api/auth/change-password".equals(normalizePath(request.getRequestURI())),
            request -> "/error".equals(normalizePath(request.getRequestURI()))
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
        User user = loadUserPort.loadUserByUsername(username).orElse(null);
        boolean isAllowedPath = ALLOWED_MATCHERS_WHEN_PASSWORD_CHANGE_REQUIRED.stream().anyMatch(m -> m.matches(request));

        if (user != null && user.mustChangePassword() && !isAllowedPath) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"title\":\"Password Change Required\",\"status\":403,\"detail\":\"You must change your password before accessing other resources.\"}");
            log.warn("Blocked request for user={} due to required password change, method={}, uri={}",
                    username, request.getMethod(), request.getRequestURI());
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "/";
        }

        if (path.length() > 1 && path.endsWith("/")) {
            return path.substring(0, path.length() - 1);
        }

        return path;
    }
}
