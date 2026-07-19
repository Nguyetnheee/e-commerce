package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class WarehouseReceiptSummaryResponse {
    private String code;
    private String supplier;
    private LocalDateTime createdAt;
    private Integer totalQty;
    private BigDecimal totalValue;
    private String createdBy;
}
