package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.response.BrandResponse;
import com.example.fishingecommerce.backend.enums.Locations;
import com.example.fishingecommerce.backend.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brand (Public)", description = "Danh sach thuong hieu cong khai")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Lay danh sach thuong hieu")
    public ResponseEntity<List<BrandResponse>> getAllBrands(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Locations location) {
        if (categoryId == null && location == null) {
            return ResponseEntity.ok(brandService.findAll());
        }
        return ResponseEntity.ok(brandService.findAvailableBrands(categoryId, location));
    }
}
