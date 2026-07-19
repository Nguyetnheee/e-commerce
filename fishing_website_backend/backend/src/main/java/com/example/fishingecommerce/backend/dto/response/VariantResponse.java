package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VariantResponse {
    private Long id;
    private Long productId;
    private String sku;
    private String variantName;
    private BigDecimal basePrice;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
}
