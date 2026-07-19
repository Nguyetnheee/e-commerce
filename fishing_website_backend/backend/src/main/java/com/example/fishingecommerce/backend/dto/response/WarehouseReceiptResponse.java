package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class WarehouseReceiptResponse {
    private String code;
    private String supplier;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private Integer totalQty;
    private BigDecimal totalValue;
    private List<WarehouseReceiptItemResponse> items;
}
