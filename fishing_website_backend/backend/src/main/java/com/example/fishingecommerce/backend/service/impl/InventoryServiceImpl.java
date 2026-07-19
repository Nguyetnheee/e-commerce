package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.response.InventoryLogResponse;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import com.example.fishingecommerce.backend.entity.InventoryLog;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.repository.InventoryLogRepository;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import com.example.fishingecommerce.backend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductVariantRepository variantRepository;
    private final InventoryLogRepository inventoryLogRepository;

    @Override
    public List<VariantResponse> findOutOfStockAlerts() {
        return variantRepository.findAll().stream()
                .filter(v -> v.getStockQuantity() == null || v.getStockQuantity() == 0)
                .map(ProductVariantServiceImpl::mapToResponse)
                .collect(Collectors.toList());
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

        return logs.stream().map(this::mapToResponse).collect(Collectors.toList());
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
