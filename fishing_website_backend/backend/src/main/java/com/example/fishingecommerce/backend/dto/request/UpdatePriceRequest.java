package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdatePriceRequest {
    @NotNull
    private BigDecimal basePrice;

    private BigDecimal discountPrice;
}
