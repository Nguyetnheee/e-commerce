package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateSupplierRequest;
import com.example.fishingecommerce.backend.dto.response.SupplierResponse;
import com.example.fishingecommerce.backend.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/suppliers")
@RequiredArgsConstructor
@Tag(name = "Admin Supplier", description = "Supplier management")
@SecurityRequirement(name = "Bearer Authentication")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get supplier list")
    public ResponseEntity<List<SupplierResponse>> getSuppliers() {
        return ResponseEntity.ok(supplierService.findAll());
    }

    @PostMapping
    @Operation(summary = "Create supplier")
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete supplier")
    public ResponseEntity<java.util.Map<String, String>> deleteSupplier(@PathVariable String id) {
        supplierService.deleteByCode(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Xoa nha cung cap thanh cong"));
    }
}
