package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateBrandRequest {
    @NotBlank
    private String name;
    private String country;
}
