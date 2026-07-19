package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryDashboardResponse {
    private Long totalStock;
    private Long lowStockSkuCount;
    private Long packingOrderCount;
    private Long todayReceiptCount;
    private Integer lowStockThreshold;
}
