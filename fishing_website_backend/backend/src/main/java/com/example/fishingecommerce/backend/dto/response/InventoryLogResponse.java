package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryLogResponse {
    private Long id;
    private Long variantId;
    private String variantName;
    private String productName;
    private Integer quantityChange;
    private Integer previousStock;
    private Integer newStock;
    private String reason;
    private String createdBy;
    private LocalDateTime createdAt;
}
