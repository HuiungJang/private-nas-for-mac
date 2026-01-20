package com.manas.backend.context.auth.infrastructure.security;

import com.manas.backend.context.auth.application.port.out.IpConfigurationPort;
import com.manas.backend.context.auth.domain.event.IpAccessChangedEvent;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.lang.NonNull;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
@RequiredArgsConstructor
public class IpEnforcementFilter extends OncePerRequestFilter {

    private final IpConfigurationPort ipConfigurationPort;
    private volatile List<IpAddressMatcher> allowedMatchers = Collections.emptyList();
    private final AtomicBoolean initialized = new AtomicBoolean(false);

    @EventListener
    public void onIpAccessChanged(IpAccessChangedEvent event) {
        log.info("IP Access Config changed. Reloading...");
        reloadConfig();
    }

    private void reloadConfig() {
        try {
            List<String> subnets = ipConfigurationPort.getAllowedSubnets();
            this.allowedMatchers = subnets.stream()
                    .map(String::trim)
                    .filter(StringUtils::hasText)
                    .map(IpAddressMatcher::new)
                    .toList();
            log.info("Allowed IP Subnets updated: {}", subnets);
        } catch (Exception e) {
            log.error("Failed to load IP configuration", e);
        }
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        if (initialized.compareAndSet(false, true)) {
            reloadConfig();
        }

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
