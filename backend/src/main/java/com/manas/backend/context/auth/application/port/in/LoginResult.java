package com.manas.backend.context.auth.application.port.in;

public record LoginResult(String token, boolean mustChangePassword) {
}
