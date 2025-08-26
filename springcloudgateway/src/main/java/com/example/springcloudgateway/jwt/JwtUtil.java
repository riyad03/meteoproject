package com.example.springcloudgateway.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.security.Key;
import java.util.List;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "Ou8K3y3HBoMG0vS/QigykfHp17+E/O7xtt2TNgk04HM=";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour

    private static final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Generate JWT
    public static String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .claim("roles", List.of("test"))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Validate JWT
    public static Claims validateToken(String token) {
        try {
            // parseClaimsJws returns Jws<Claims>, get the body to extract Claims
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();   // <- extract Claims from Jws
        } catch (JwtException e) {
            // token invalid, expired, or malformed
            System.out.println("Invalid JWT: " + e.getMessage());
            return null; // or throw custom exception
        }
    }

    public static boolean valideToken (String token) {
        try {
            // parseClaimsJws returns Jws<Claims>, get the body to extract Claims
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            // token invalid, expired, or malformed
            System.out.println("Invalid JWT: " + e.getMessage());
            return false; // or throw custom exception
        }
    }

    // Extract username
    public static String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}

