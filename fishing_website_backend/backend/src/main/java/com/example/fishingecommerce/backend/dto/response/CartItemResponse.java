package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long variantId;
    private String productName;
    private String variantName;
    private String sku;
    private BigDecimal price;
    private String image;
    private Integer quantity;
}
