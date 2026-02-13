package com.manas.backend.common.security;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
public class ClientIpResolver {

    private final List<IpAddressMatcher> trustedProxyMatchers;

    public ClientIpResolver(@Value("${security.network.trusted-proxies:}") String trustedProxies) {
        this.trustedProxyMatchers = Arrays.stream(trustedProxies.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .peek(this::warnIfBroadProxyRange)
                .map(this::toMatcherOrNull)
                .filter(java.util.Objects::nonNull)
                .toList();

        if (trustedProxyMatchers.isEmpty()) {
            log.info("No trusted proxies configured. X-Forwarded-For will be ignored.");
        }
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();

        if (!isTrustedProxy(remoteAddr)) {
            return remoteAddr;
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (!StringUtils.hasText(forwardedFor)) {
            return remoteAddr;
        }

        String firstClientIp = forwardedFor.split(",")[0].trim();
        if (!StringUtils.hasText(firstClientIp)) {
            return remoteAddr;
        }

        return firstClientIp;
    }

    private boolean isTrustedProxy(String remoteAddr) {
        if (trustedProxyMatchers.isEmpty()) {
            return false;
        }

        try {
            return trustedProxyMatchers.stream().anyMatch(matcher -> matcher.matches(remoteAddr));
        } catch (Exception e) {
            log.warn("Failed to evaluate trusted proxy range for remoteAddr={}", remoteAddr);
            return false;
        }
    }

    private void warnIfBroadProxyRange(String cidr) {
        if ("0.0.0.0/0".equals(cidr) || "::/0".equals(cidr)) {
            log.warn("Overly broad trusted proxy CIDR detected: {}. This allows spoofed X-Forwarded-For.", cidr);
        }
    }

    private IpAddressMatcher toMatcherOrNull(String cidr) {
        try {
            return new IpAddressMatcher(cidr);
        } catch (Exception e) {
            log.warn("Ignoring invalid trusted proxy CIDR: {}", cidr);
            return null;
        }
    }
}
