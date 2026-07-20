package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.response.InventoryLogResponse;
import com.example.fishingecommerce.backend.dto.response.InventoryDashboardResponse;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import com.example.fishingecommerce.backend.entity.InventoryLog;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.repository.InventoryLogRepository;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.repository.WarehouseReceiptRepository;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final ProductVariantRepository variantRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final OrderRepository orderRepository;
    private final WarehouseReceiptRepository warehouseReceiptRepository;

    @Override
    public List<VariantResponse> findOutOfStockAlerts() {
        return variantRepository.findAll().stream()
                .filter(v -> v.getStockQuantity() == null || v.getStockQuantity() <= LOW_STOCK_THRESHOLD)
                .map(ProductVariantServiceImpl::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VariantResponse> findAllItems() {
        return variantRepository.findAll().stream()
                .map(ProductVariantServiceImpl::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDashboardResponse getDashboardSummary() {
        List<ProductVariant> variants = variantRepository.findAll();
        long totalStock = variants.stream()
                .map(ProductVariant::getStockQuantity)
                .filter(java.util.Objects::nonNull)
                .mapToLong(Integer::longValue)
                .sum();
        long lowStockCount = variants.stream()
                .filter(v -> v.getStockQuantity() == null || v.getStockQuantity() <= LOW_STOCK_THRESHOLD)
                .count();
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime startOfNextDay = startOfDay.plusDays(1);

        return InventoryDashboardResponse.builder()
                .totalStock(totalStock)
                .lowStockSkuCount(lowStockCount)
                .packingOrderCount(orderRepository.countByStatus(OrderStatus.PACKING))
                .todayReceiptCount(warehouseReceiptRepository.countByCreatedAtBetween(startOfDay, startOfNextDay))
                .lowStockThreshold(LOW_STOCK_THRESHOLD)
                .build();
    }

    @Override
    public List<InventoryLogResponse> findLogs(Long variantId, LocalDateTime from, LocalDateTime to) {
        List<InventoryLog> logs;
        if (variantId != null && from != null && to != null) {
            logs = inventoryLogRepository.findByVariantIdAndCreatedAtBetween(variantId, from, to);
        } else if (variantId != null) {
            logs = inventoryLogRepository.findByVariantId(variantId);
        } else {
            logs = inventoryLogRepository.findAll();
        }

        return logs.stream()
                .sorted(java.util.Comparator.comparing(
                        InventoryLog::getCreatedAt,
                        java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())).reversed())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private InventoryLogResponse mapToResponse(InventoryLog log) {
        return InventoryLogResponse.builder()
                .id(log.getId())
                .variantId(log.getVariant() != null ? log.getVariant().getId() : null)
                .variantName(log.getVariant() != null ? log.getVariant().getVariantName() : null)
                .productName(log.getVariant() != null && log.getVariant().getProduct() != null
                        ? log.getVariant().getProduct().getName() : null)
                .quantityChange(log.getQuantityChange())
                .previousStock(log.getPreviousStock())
                .newStock(log.getNewStock())
                .reason(log.getReason())
                .createdBy(log.getCreatedBy())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
