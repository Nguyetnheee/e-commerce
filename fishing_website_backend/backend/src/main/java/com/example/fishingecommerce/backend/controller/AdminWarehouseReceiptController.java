package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateWarehouseReceiptRequest;
import com.example.fishingecommerce.backend.dto.response.WarehouseReceiptResponse;
import com.example.fishingecommerce.backend.dto.response.WarehouseReceiptSummaryResponse;
import com.example.fishingecommerce.backend.service.WarehouseReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/warehouse/receipts")
@RequiredArgsConstructor
@Tag(name = "Admin Warehouse Receipt", description = "Warehouse receiving vouchers")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminWarehouseReceiptController {

    private final WarehouseReceiptService warehouseReceiptService;

    @PostMapping
    @Operation(summary = "Create warehouse receipt")
    public ResponseEntity<WarehouseReceiptResponse> createReceipt(
            @Valid @RequestBody CreateWarehouseReceiptRequest request,
            @AuthenticationPrincipal String createdBy) {
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseReceiptService.create(request, createdBy));
    }

    @GetMapping
    @Operation(summary = "List warehouse receipts")
    public ResponseEntity<List<WarehouseReceiptSummaryResponse>> getReceipts() {
        return ResponseEntity.ok(warehouseReceiptService.findAll());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get warehouse receipt detail")
    public ResponseEntity<WarehouseReceiptResponse> getReceipt(@PathVariable String code) {
        return ResponseEntity.ok(warehouseReceiptService.findByCode(code));
    }
}
