package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TopSellingResponse {
    private Long productId;
    private String productName;
    private Long variantId;
    private String variantName;
    private Long totalQuantity;
    private BigDecimal totalRevenue;
}
