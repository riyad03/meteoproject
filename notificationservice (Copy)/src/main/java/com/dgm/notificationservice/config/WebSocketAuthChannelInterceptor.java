package com.dgm.notificationservice.config;

import com.dgm.notificationservice.jwt.JwtUtil;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();
    private final JwtUtil jwtUtil;
    public WebSocketAuthChannelInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Check if Authorization header exists before processing
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String username = jwtUtil.extractUsername(token);
                    if (username != null && jwtUtil.validateToken(token)) {
                        accessor.setUser(new UsernamePasswordAuthenticationToken(username, null));
                        sessionUserMap.put(accessor.getSessionId(), username);
                        System.out.println("WebSocket CONNECT: User authenticated: " + username);
                    }
                } catch (Exception e) {
                    System.err.println("WebSocket authentication failed: " + e.getMessage());
                }
            }
        } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            // Clean up on disconnect
            sessionUserMap.remove(accessor.getSessionId());
        }
        
        return message;
    }

    public String getUsername(String sessionId) {
        return sessionUserMap.get(sessionId);
    }
}
