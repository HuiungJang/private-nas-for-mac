package com.manas.backend.context.auth.infrastructure.security;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.common.security.ClientIpResolver;
import com.manas.backend.context.auth.application.port.out.IpConfigurationPort;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class IpEnforcementFilterTest {

    @Mock
    private IpConfigurationPort ipConfigurationPort;

    @Mock
    private ClientIpResolver clientIpResolver;

    private IpEnforcementFilter filter;

    @BeforeEach
    void setUp() {
        filter = new IpEnforcementFilter(ipConfigurationPort, clientIpResolver);
    }

    @Test
    @DisplayName("Should allow access if IP is in subnet")
    void shouldAllowAccess() throws Exception {
        // Given
        when(ipConfigurationPort.getAllowedSubnets()).thenReturn(List.of("192.168.1.0/24"));

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(clientIpResolver.resolve(request)).thenReturn("192.168.1.5");

        HttpServletResponse response = mock(HttpServletResponse.class);
        FilterChain chain = mock(FilterChain.class);

        // When
        filter.doFilterInternal(request, response, chain);

        // Then
        verify(chain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should deny access if IP is not in subnet")
    void shouldDenyAccess() throws Exception {
        // Given
        when(ipConfigurationPort.getAllowedSubnets()).thenReturn(List.of("10.0.0.0/8"));

        HttpServletRequest request = mock(HttpServletRequest.class);
        when(clientIpResolver.resolve(request)).thenReturn("192.168.1.5");

        HttpServletResponse response = mock(HttpServletResponse.class);
        when(response.getWriter()).thenReturn(new PrintWriter(new StringWriter())); // Mock Writer

        FilterChain chain = mock(FilterChain.class);

        // When
        filter.doFilterInternal(request, response, chain);

        // Then
        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
    }

}
