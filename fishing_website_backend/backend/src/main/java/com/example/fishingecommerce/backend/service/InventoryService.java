package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.response.InventoryLogResponse;
import com.example.fishingecommerce.backend.dto.response.InventoryDashboardResponse;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryService {
    List<VariantResponse> findOutOfStockAlerts();
    InventoryDashboardResponse getDashboardSummary();
    List<InventoryLogResponse> findLogs(Long variantId, LocalDateTime from, LocalDateTime to);
}
