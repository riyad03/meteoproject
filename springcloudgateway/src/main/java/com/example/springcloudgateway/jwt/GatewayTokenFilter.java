package com.example.springcloudgateway.jwt;

import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class GatewayTokenFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    // Map roles to Eureka service IDs
    private final Map<String, String> roleToServiceMap = Map.of(
            "ADMIN", "admin-service",
            "USER", "user-service",
            "test", "DATAMANAGER"  // role "test" maps to "servicetest"
    );

    public GatewayTokenFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
        System.err.println("=== GatewayTokenFilter CONSTRUCTOR CALLED ===");
        System.err.println("=== JwtUtil injected: " + (jwtUtil != null ? "SUCCESS" : "NULL") + " ===");
        System.err.println("=== Filter Order: " + this.getOrder() + " ===");
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        System.err.println("=== FILTER EXECUTING for: " + exchange.getRequest().getURI());
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return setUnauthorizedResponse(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        try {
            System.err.println("=== Starting JWT validation ===");
            // Validate token first
            Claims claims = JwtUtil.validateToken(token);
            System.err.println("=== JWT validation completed, claims: " + (claims != null ? "SUCCESS" : "NULL") + " ===");

            if (claims == null) {
                return setUnauthorizedResponse(exchange, "Invalid JWT token");
            }

            List<String> roles = claims.get("roles", List.class);
            System.err.println("Roles claim: " + claims.get("roles"));
            System.err.println("=== Roles extracted: " + roles + " ===");

            if (roles == null || roles.isEmpty()) {
                return setUnauthorizedResponse(exchange, "No roles found in token");
            }

            // Pick the first role
            String role = roles.get(0);
            System.err.println("=== Selected role: " + role + " ===");

            String serviceId = roleToServiceMap.get(role);
            System.err.println("=== Mapped to service: " + serviceId + " ===");

            if (serviceId == null) {
                return setForbiddenResponse(exchange, "Role not authorized: " + role);
            }

            System.err.println("=== AUTH SUCCESS - Role: " + role + " -> Service: " + serviceId + " ===");

            // TEMPORARY: Return success response instead of routing
            //return setSuccessResponse(exchange, "AUTH SUCCESS - Would route to: " + serviceId);

            // COMMENTED OUT FOR TESTING - This is what was causing the hang

            // Build new URI for Eureka load-balanced service
            URI newUri = URI.create("lb://" + serviceId + exchange.getRequest().getURI().getPath());
            System.err.println("service: "+serviceId);
            // Mutate the request with the new URI
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .uri(newUri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token) // forward original JWT
                .header("X-Roles", String.join(",", roles))
                .header("X-Username", claims.getSubject())
                .build();


            // Set authentication in Security Context
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(claims.getSubject(), null, authorities);

            return chain.filter(exchange.mutate().request(mutatedRequest).build())
                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth));


        } catch (Exception e) {
            return setForbiddenResponse(exchange, "Token validation failed: " + e.getMessage());
        }
    }

    private Mono<Void> setSuccessResponse(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.OK);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        String body = "{\"success\":\"" + message + "\"}";
        var buffer = exchange.getResponse().bufferFactory().wrap(body.getBytes());
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    private Mono<Void> setUnauthorizedResponse(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        String body = "{\"error\":\"Unauthorized - " + message + "\"}";
        var buffer = exchange.getResponse().bufferFactory().wrap(body.getBytes());
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    private Mono<Void> setForbiddenResponse(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        String body = "{\"error\":\"Forbidden - " + message + "\"}";
        var buffer = exchange.getResponse().bufferFactory().wrap(body.getBytes());
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -200; // Execute BEFORE Spring Security filters
    }
}