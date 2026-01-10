package com.manas.backend.context.auth.infrastructure.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {

    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"; // Same as dev prop
    private final long expiration = 3600000; // 1 hour
    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expiration);
    }

    @Test
    @DisplayName("Should generate valid token and retrieve username")
    void generateAndValidateToken() {
        // Given
        String username = "testuser";

        // When
        String token = tokenProvider.generateToken(username);

        // Then
        assertThat(token).isNotNull();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getUsernameFromToken(token)).isEqualTo(username);
    }

    @Test
    @DisplayName("Should return false for invalid token")
    void validateToken_Invalid() {
        String invalidToken = "invalid.token.value";
        assertThat(tokenProvider.validateToken(invalidToken)).isFalse();
    }

    @Test
    @DisplayName("Should return false for expired token")
    void validateToken_Expired() throws InterruptedException {
        // Given a provider with short expiration
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(secret, 1); // 1ms
        String token = shortLivedProvider.generateToken("expiredUser");

        // Wait for expiration
        Thread.sleep(10);

        // Then
        assertThat(shortLivedProvider.validateToken(token)).isFalse();
    }

}
