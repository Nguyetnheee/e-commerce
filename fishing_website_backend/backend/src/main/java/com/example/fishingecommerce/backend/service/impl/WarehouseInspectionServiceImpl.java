package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateWarehouseInspectionRequest;
import com.example.fishingecommerce.backend.dto.response.WarehouseInspectionResponse;
import com.example.fishingecommerce.backend.entity.WarehouseInspection;
import com.example.fishingecommerce.backend.enums.WarehouseInspectionStatus;
import com.example.fishingecommerce.backend.repository.WarehouseInspectionRepository;
import com.example.fishingecommerce.backend.service.WarehouseInspectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WarehouseInspectionServiceImpl implements WarehouseInspectionService {

    private final WarehouseInspectionRepository inspectionRepository;

    @Override
    public WarehouseInspectionResponse create(CreateWarehouseInspectionRequest request) {
        WarehouseInspectionStatus persistedStatus = request.getStatus() == WarehouseInspectionStatus.FAILED
                ? WarehouseInspectionStatus.REJECTED_REPORTED
                : WarehouseInspectionStatus.APPROVED;

        WarehouseInspection inspection = WarehouseInspection.builder()
                .supplierName(request.getSupplier())
                .inspectType(request.getInspectType())
                .status(persistedStatus)
                .notes(request.getNotes())
                .quantityMatched(request.getChecklist() != null ? request.getChecklist().getQuantityMatched() : null)
                .packagingIntact(request.getChecklist() != null ? request.getChecklist().getPackagingIntact() : null)
                .modelCorrect(request.getChecklist() != null ? request.getChecklist().getModelCorrect() : null)
                .conditionGood(request.getChecklist() != null ? request.getChecklist().getConditionGood() : null)
                .accessoriesIncluded(request.getChecklist() != null ? request.getChecklist().getAccessoriesIncluded() : null)
                .warrantyCardIncluded(request.getChecklist() != null ? request.getChecklist().getWarrantyCardIncluded() : null)
                .rejectedQuantity(request.getRejectedQuantity())
                .reportedToAdmin(request.getStatus() == WarehouseInspectionStatus.FAILED)
                .build();

        WarehouseInspection saved = inspectionRepository.save(inspection);
        return WarehouseInspectionResponse.builder()
                .inspectionId(saved.getId())
                .status(saved.getStatus())
                .reportedToAdmin(saved.getReportedToAdmin())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
