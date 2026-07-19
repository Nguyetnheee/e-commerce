package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CouponValidationResponse {
    private boolean valid;
    private String couponCode;
    private String message;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
