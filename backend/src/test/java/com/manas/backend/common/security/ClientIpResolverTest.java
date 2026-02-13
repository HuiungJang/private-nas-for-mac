package com.manas.backend.common.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class ClientIpResolverTest {

    @Test
    @DisplayName("trusted proxy일 때 X-Forwarded-For의 첫 번째 IP를 사용한다")
    void shouldUseXffWhenRemoteIsTrustedProxy() {
        ClientIpResolver resolver = new ClientIpResolver("127.0.0.1/32");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "203.0.113.10, 127.0.0.1");

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.10");
    }

    @Test
    @DisplayName("trusted proxy가 아니면 remoteAddr를 사용한다")
    void shouldUseRemoteAddrWhenProxyNotTrusted() {
        ClientIpResolver resolver = new ClientIpResolver("10.0.0.0/8");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.168.0.2");
        request.addHeader("X-Forwarded-For", "203.0.113.10");

        assertThat(resolver.resolve(request)).isEqualTo("192.168.0.2");
    }

    @Test
    @DisplayName("invalid CIDR는 무시되고, trusted proxy 미설정처럼 동작한다")
    void shouldIgnoreInvalidCidrAndFallbackToRemoteAddr() {
        ClientIpResolver resolver = new ClientIpResolver("bad-cidr-value");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "203.0.113.10");

        assertThat(resolver.resolve(request)).isEqualTo("127.0.0.1");
    }
}
