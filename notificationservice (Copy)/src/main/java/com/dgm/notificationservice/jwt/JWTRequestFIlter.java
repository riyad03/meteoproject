package com.dgm.notificationservice.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JWTRequestFIlter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterchain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        /*if (path.startsWith("/internal/") || path.startsWith("/service/")) {
            String serviceToken = request.getHeader("X-Service-Token");
            if (serviceToken != null && serviceToken.equals(internalServiceToken)) {
                filterChain.doFilter(request, response);
                return;
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }*/

        // 2. External requests: validate user JWT
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            if (jwtUtil.validateToken(jwt)) {
                username = jwtUtil.extractUsername(jwt);
            }else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        } else {
            // No JWT provided for external protected endpoint
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        filterchain.doFilter(request, response);
    }
}
/*curl http://localhost:8081/datamanager/test/notif \ 
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyaXlhZCIsInJvbGVzIjpbInRlc3QiXSwiaWF0IjoxNzU2MTQ2ODUwLCJleHAiOjE3NTYxNTA0NTB9.Xm1Qr99WIWosMwg2Wmj_7r7xOIypX5MIJzarpk3rloo" 
   */

//eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyaXlhZCIsImlhdCI6MTc1NjE0ODE4OSwiZXhwIjoxNzU2MTUxNzg5fQ.cv-9wIFnJE8jI60X-q6wVrjYVqwRCTAEUuR8trWPkDk