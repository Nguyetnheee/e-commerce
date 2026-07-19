package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.WarehouseInspectionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WarehouseInspectionResponse {
    private Long inspectionId;
    private WarehouseInspectionStatus status;
    private Boolean reportedToAdmin;
    private LocalDateTime createdAt;
}
