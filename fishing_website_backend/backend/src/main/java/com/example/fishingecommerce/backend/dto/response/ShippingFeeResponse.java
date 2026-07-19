package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ShippingFeeResponse {
    private BigDecimal shippingFee;
    private BigDecimal estimatedWeightKg;
}
