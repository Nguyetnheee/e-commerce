package com.example.fishingecommerce.backend.dto.request;

import com.example.fishingecommerce.backend.enums.WarehouseInspectionStatus;
import com.example.fishingecommerce.backend.enums.WarehouseInspectionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateWarehouseInspectionRequest {
    @NotBlank
    private String supplier;

    @NotNull
    private WarehouseInspectionType inspectType;

    @NotNull
    private WarehouseInspectionStatus status;

    private String notes;

    @Valid
    private InspectionChecklistRequest checklist;

    private Integer rejectedQuantity;
}
