package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class WarehouseReceiptItemResponse {
    private String sku;
    private Integer qty;
    private BigDecimal price;
    private String shelf;
}
