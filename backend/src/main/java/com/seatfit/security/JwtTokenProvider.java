package com.seatfit.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiry-ms}") long accessTokenExpiry,
            @Value("${jwt.refresh-token-expiry-ms}") long refreshTokenExpiry) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
    }

    public String generateAccessToken(UUID userId, String role, UUID centreId) {
        return buildToken(userId, role, centreId, accessTokenExpiry, "access");
    }

    public String generateRefreshToken(UUID userId, String role, UUID centreId) {
        return buildToken(userId, role, centreId, refreshTokenExpiry, "refresh");
    }

    private String buildToken(UUID userId, String role, UUID centreId, long expiry, String type) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .claim("centreId", centreId != null ? centreId.toString() : null)
                .claim("type", type)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiry))
                .signWith(key)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public String getRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public UUID getCentreId(String token) {
        String centreId = parseToken(token).get("centreId", String.class);
        return centreId != null ? UUID.fromString(centreId) : null;
    }
}
