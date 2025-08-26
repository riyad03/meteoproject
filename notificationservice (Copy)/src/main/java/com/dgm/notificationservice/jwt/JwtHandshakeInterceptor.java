package com.dgm.notificationservice.jwt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.http.server.ServletServerHttpRequest;

import io.jsonwebtoken.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Value("${jwt.secret}")
    private String secretKey;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {

        System.out.println("WebSocket handshake attempt from: " + request.getRemoteAddress());

        // Try to get token from Authorization header first
        List<String> authHeaders = request.getHeaders().get("Authorization");
        String token = null;

        if (authHeaders != null && !authHeaders.isEmpty()) {
            token = authHeaders.get(0).replace("Bearer ", "");
            System.out.println("Token from Authorization header: " + token.substring(0, Math.min(20, token.length())) + "...");
        } else {
            // Try to get token from query parameter (for SockJS compatibility)
            URI uri = request.getURI();
            String query = uri.getQuery();
            if (query != null && query.contains("token=")) {
                token = UriComponentsBuilder.fromUri(uri).build().getQueryParams().getFirst("token");
                System.out.println("Token from query parameter: " +
                        (token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "null"));
            }
        }

        if (token != null) {
            try {
                Claims claims = Jwts.parser()
                        .setSigningKey(secretKey.getBytes())
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();

                // Store username in attributes (optional if you want it in session attributes)
                attributes.put("username", username);

                // Also attach a Principal so Spring events can read event.getUser()
                attributes.put("principal", (java.security.Principal) () -> username);

                // For Servlet-based requests, also attach the Principal to the request object
                if (request instanceof org.springframework.http.server.ServletServerHttpRequest servletRequest) {
                    servletRequest.getServletRequest().setAttribute("principal",
                            (java.security.Principal) () -> username);
                }

                System.out.println("WebSocket authentication successful for user: " + username);
                return true;

            } catch (JwtException e) {
                System.err.println("JWT validation failed: " + e.getMessage());
                return false;
            }
        }

        System.err.println("No valid JWT token found in request");
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        if (exception != null) {
            System.err.println("WebSocket handshake failed: " + exception.getMessage());
        } else {
            System.out.println("WebSocket handshake completed successfully");
        }
    }
}
