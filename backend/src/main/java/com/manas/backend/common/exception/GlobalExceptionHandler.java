package com.manas.backend.common.exception;

import java.net.URI;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String DEFAULT_TIMESTAMP = "timestamp";

    @ExceptionHandler(SecurityException.class)
    ProblemDetail handleSecurityException(SecurityException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, e.getMessage());
        problemDetail.setTitle("Access Denied");
        problemDetail.setType(URI.create("https://manas.com/errors/access-denied"));
        problemDetail.setProperty(DEFAULT_TIMESTAMP, Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ProblemDetail handleIllegalArgumentException(IllegalArgumentException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage());
        problemDetail.setTitle("Invalid Argument");
        problemDetail.setType(URI.create("https://manas.com/errors/invalid-argument"));
        problemDetail.setProperty(DEFAULT_TIMESTAMP, Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleResourceNotFoundException(ResourceNotFoundException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        problemDetail.setTitle("Resource Not Found");
        problemDetail.setType(URI.create("https://manas.com/errors/not-found"));
        problemDetail.setProperty(DEFAULT_TIMESTAMP, Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(FileOperationException.class)
    ProblemDetail handleFileOperationException(FileOperationException e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        problemDetail.setTitle("File Operation Failed");
        problemDetail.setType(URI.create("https://manas.com/errors/file-operation-failed"));
        problemDetail.setProperty(DEFAULT_TIMESTAMP, Instant.now());
        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleGenericException(Exception e) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setProperty(DEFAULT_TIMESTAMP, Instant.now());
        // In production, log the full stack trace here, but don't expose it to the client
        return problemDetail;
    }
}
