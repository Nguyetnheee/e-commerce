package com.example.fishingecommerce.backend.config;

import com.example.fishingecommerce.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getServletPath();
        String method = request.getMethod();

        if (isExcludedPath(path, method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = jwtService.extractSubject(token);
        Long parsedUserId;
        try {
            parsedUserId = Long.valueOf(userId);
        } catch (NumberFormatException exception) {
            rejectInvalidSession(response);
            return;
        }

        if (!userRepository.existsById(parsedUserId)) {
            rejectInvalidSession(response);
            return;
        }

        List<String> roles = jwtService.extractRoles(token);

        var authorities = roles.stream()
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .toList();

        var authentication = new UsernamePasswordAuthenticationToken(userId, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private void rejectInvalidSession(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.\"}");
    }

    private boolean isExcludedPath(String path, String method) {
        return "OPTIONS".equalsIgnoreCase(method)
                || path.startsWith("/api/v1/auth/")
                || path.startsWith("/swagger-ui/")
                || "/swagger-ui.html".equals(path)
                || "/swagger-ui/index.html".equals(path)
                || "/v3/api-docs".equals(path)
                || "/v3/api-docs/swagger-config".equals(path)
                || path.startsWith("/v3/api-docs/")
                || path.startsWith("/api/v1/posts")
                || (HttpMethod.GET.matches(method) && (
                    path.equals("/api/products") || path.startsWith("/api/products/") ||
                    path.equals("/api/v1/products") || path.startsWith("/api/v1/products/")
                   ));
    }
}
