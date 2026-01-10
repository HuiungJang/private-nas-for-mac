package com.manas.backend.common.tracing;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Ensure this runs before Security and other filters
public class TraceIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 1. Extract or Generate Trace ID
            String traceId = request.getHeader(TraceConstants.TRACE_ID_HEADER);
            if (!StringUtils.hasText(traceId)) {
                traceId = UUID.randomUUID().toString();
            }

            // 2. Put in MDC
            MDC.put(TraceConstants.TRACE_ID_MDC_KEY, traceId);

            // 3. Add to Response Header
            response.setHeader(TraceConstants.TRACE_ID_HEADER, traceId);

            filterChain.doFilter(request, response);
        } finally {
            // 4. Cleanup to prevent leakage in thread pool
            MDC.remove(TraceConstants.TRACE_ID_MDC_KEY);
        }
    }

}
