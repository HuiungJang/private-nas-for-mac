package com.manas.backend.common.tracing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class TraceIdFilterTest {

    private final TraceIdFilter traceIdFilter = new TraceIdFilter();

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    @DisplayName("Should generate Trace ID if missing in request")
    void doFilterInternal_GenerateId() throws ServletException, IOException {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        // When
        traceIdFilter.doFilterInternal(request, response, filterChain);

        // Then
        String traceId = response.getHeader(TraceConstants.TRACE_ID_HEADER);
        assertThat(traceId).isNotNull();
        // We can't verify MDC directly here because it's cleared in finally block,
        // but typically integration tests or a wrapper would verify MDC state inside the chain.
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should preserve existing Trace ID from request")
    void doFilterInternal_PreserveId() throws ServletException, IOException {
        // Given
        String existingTraceId = "my-trace-id";
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(TraceConstants.TRACE_ID_HEADER, existingTraceId);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        // When
        traceIdFilter.doFilterInternal(request, response, filterChain);

        // Then
        assertThat(response.getHeader(TraceConstants.TRACE_ID_HEADER)).isEqualTo(existingTraceId);
        verify(filterChain).doFilter(request, response);
    }

}
