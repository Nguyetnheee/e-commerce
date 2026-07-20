package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank
    private String title;

    private String htmlContent;

    private String author;

    private String imageUrl;

    private String categoryName;

    private String terrain;

    private Boolean isVisible;
}
