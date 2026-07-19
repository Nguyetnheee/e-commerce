package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WarehouseReceiptItemRequest {
    @NotBlank
    private String sku;

    @NotNull
    private Integer qty;

    @NotNull
    private BigDecimal price;

    private String shelf;
}
