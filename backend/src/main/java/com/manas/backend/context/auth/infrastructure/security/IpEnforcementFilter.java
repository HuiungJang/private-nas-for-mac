package com.manas.backend.context.auth.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
public class IpEnforcementFilter extends OncePerRequestFilter {

    private final List<IpAddressMatcher> allowedMatchers;

    public IpEnforcementFilter(@Value("${security.vpn.allowed-subnets}") String allowedSubnets) {
        this.allowedMatchers = Arrays.stream(allowedSubnets.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(IpAddressMatcher::new)
                .toList();
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIp(request);

        boolean isAllowed = allowedMatchers.stream()
                .anyMatch(matcher -> matcher.matches(clientIp));

        if (!isAllowed) {
            log.warn("Access denied for IP: {}. Not in allowed subnets.", clientIp);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter()
                    .write("{\"title\": \"Access Denied\", \"status\": 403, \"detail\": \"IP address not allowed.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xfHeader)) {
            // X-Forwarded-For: client, proxy1, proxy2
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

}
