package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VariantDetailResponse {
    private Long id;
    private String sku;
    private String name;
    private BigDecimal basePrice;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private Long productId;
}
