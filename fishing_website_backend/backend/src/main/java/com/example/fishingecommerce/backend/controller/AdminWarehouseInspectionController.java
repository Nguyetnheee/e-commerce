package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateWarehouseInspectionRequest;
import com.example.fishingecommerce.backend.dto.response.WarehouseInspectionResponse;
import com.example.fishingecommerce.backend.service.WarehouseInspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/warehouse/inspections")
@RequiredArgsConstructor
@Tag(name = "Admin Warehouse Inspection", description = "Receiving quality inspection")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminWarehouseInspectionController {

    private final WarehouseInspectionService warehouseInspectionService;

    @PostMapping
    @Operation(summary = "Create inspection log")
    public ResponseEntity<WarehouseInspectionResponse> createInspection(@Valid @RequestBody CreateWarehouseInspectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseInspectionService.create(request));
    }
}
