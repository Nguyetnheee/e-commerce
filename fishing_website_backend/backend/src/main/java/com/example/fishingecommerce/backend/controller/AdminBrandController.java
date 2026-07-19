package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateBrandRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateBrandRequest;
import com.example.fishingecommerce.backend.dto.response.BrandDetailResponse;
import com.example.fishingecommerce.backend.dto.response.BrandResponse;
import com.example.fishingecommerce.backend.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/brands")
@RequiredArgsConstructor
@Tag(name = "Admin Brand", description = "Danh sach thuong hieu cho quan tri")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminBrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Lay danh sach thuong hieu")
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        return ResponseEntity.ok(brandService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lay chi tiet thuong hieu")
    public ResponseEntity<BrandDetailResponse> getBrandDetail(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Tao moi thuong hieu")
    public ResponseEntity<BrandResponse> create(@Valid @RequestBody CreateBrandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cap nhat thuong hieu")
    public ResponseEntity<BrandResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateBrandRequest request) {
        return ResponseEntity.ok(brandService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoa thuong hieu")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
