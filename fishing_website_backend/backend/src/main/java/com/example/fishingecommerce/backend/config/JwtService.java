package com.example.fishingecommerce.backend.config;

import com.example.fishingecommerce.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {
    @Value("${jwt.secret:SF1SwwPXEkJi9tqxm5SvYppTx2bc9kFPmKpvpkfAH7t}")
    private String secretkey;

    private Key getSignKey() {
        // HS256 cần key đủ dài (>= 32 bytes). Key bạn đang dài nên OK.
        return Keys.hmacShaKeyFor(secretkey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        List<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList())
                : List.of(user.getRole() != null ? user.getRole().name() : "USER");

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", roleNames)
                .claim("role", user.getRole() != null ? user.getRole().name() : null)
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaimsJws(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token).getBody();
    }

    public String extractSubject(String token) {
        return extractClaimsJws(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = extractClaimsJws(token).get("roles");
        if (roles instanceof List) {
            return ((List<String>) roles);
        }
        Object role = extractClaimsJws(token).get("role");
        return role == null ? List.of() : List.of(role.toString());
    }

    public String extractRole(String token) {
        List<String> roles = extractRoles(token);
        return roles.isEmpty() ? null : roles.get(0);
    }

    public String extractUsername(String token) {
        Object username = extractClaimsJws(token).get("username");
        return username == null ? null : username.toString();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
