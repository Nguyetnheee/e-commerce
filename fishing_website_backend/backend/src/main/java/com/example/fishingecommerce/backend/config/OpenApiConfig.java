package com.example.fishingecommerce.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    @Value("${APP_PUBLIC_URL:}")
    private String appPublicUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "Bearer Authentication";
        OpenAPI openAPI = new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));

        // Keep server URLs environment-driven so Swagger uses the actual deployment host
        // instead of defaulting to localhost on Railway or any other public environment.
        if (renderExternalUrl != null && !renderExternalUrl.isBlank()) {
            openAPI.addServersItem(new Server()
                    .url(renderExternalUrl)
                    .description("Render"));
        }

        if (appPublicUrl != null && !appPublicUrl.isBlank()) {
            openAPI.addServersItem(new Server()
                    .url(appPublicUrl)
                    .description("Public API"));
        }

        return openAPI;
    }
}
