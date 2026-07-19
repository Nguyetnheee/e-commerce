package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateVariantRequest {
    @NotBlank
    private String sku;

    @NotBlank
    private String variantName;

    @NotNull
    private BigDecimal basePrice;

    private BigDecimal discountPrice;

    @NotNull
    private Integer stockQuantity;
}
