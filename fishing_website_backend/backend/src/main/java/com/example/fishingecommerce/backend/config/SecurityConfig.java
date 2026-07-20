package com.example.fishingecommerce.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*,https://*.up.railway.app,https://*.vercel.app,https://*.azurestaticapps.net}")
    private String allowedOriginPatterns;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthenticationFilter jwtAuthenticationFilter,
                                                   OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                                                   ObjectProvider<ClientRegistrationRepository> clientRegistrationRepositoryProvider) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/**",
                    "/api/v1/admin/auth/login",
                    "/api/v1/admin/auth/setup-first-admin",
                    "/api/v1/admin/auth/register-staff",
                    "/api/v1/payments/payos/**",
                    "/api/v1/orders/*/cancel-payment",
                    "/api/health",
                    "/health",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/swagger-ui/index.html",
                    "/v3/api-docs",
                    "/v3/api-docs/swagger-config",
                    "/v3/api-docs/**"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/reviews").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/posts", "/api/v1/posts/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/brands", "/api/v1/categories/tree", "/api/v1/tags").permitAll()
                .requestMatchers(SecurityConfig::isPublicProductReadRequest).permitAll()
                .requestMatchers("/api/v1/admin/orders/**").hasAnyRole("ADMIN", "MANAGER", "APPROVER", "KHO")
                .requestMatchers("/api/v1/shipper/**").hasRole("SHIPPER")
                .requestMatchers("/api/v1/inventory/**").hasAnyRole("ADMIN", "MANAGER", "KHO")
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "MANAGER", "KHO")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        ;

        if (clientRegistrationRepositoryProvider.getIfAvailable() != null) {
            http.oauth2Login(oauth -> oauth
                    .loginPage("/oauth2/authorization/google")
                    .successHandler(oAuth2LoginSuccessHandler)
            );
        }
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
            Arrays.stream(allowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList()
        );

        configuration.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private static boolean isPublicProductReadRequest(HttpServletRequest request) {
        String path = request.getServletPath();

        return HttpMethod.GET.matches(request.getMethod())
                && (path.equals("/api/products") || path.startsWith("/api/products/") ||
                    path.equals("/api/v1/products") || path.startsWith("/api/v1/products/"));
    }
}
