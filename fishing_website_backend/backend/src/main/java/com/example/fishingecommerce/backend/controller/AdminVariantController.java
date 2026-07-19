package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateVariantRequest;
import com.example.fishingecommerce.backend.dto.request.UpdatePriceRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateStockRequest;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import com.example.fishingecommerce.backend.service.ProductVariantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Product Variant", description = "Quản lý biến thể sản phẩm (variant) của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminVariantController {

    private final ProductVariantService variantService;

    @PostMapping("/products/{productId}/variants")
    @Operation(summary = "Tạo biến thể sản phẩm mới", description = "Tạo một biến thể mới cho sản phẩm theo productId")
    public ResponseEntity<VariantResponse> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody CreateVariantRequest request) {
        return ResponseEntity.ok(variantService.createVariant(productId, request));
    }

    @PutMapping("/variants/{id}/stock")
    @Operation(summary = "Cập nhật số lượng tồn kho của biến thể", description = "Cập nhật số lượng tồn kho của biến thể theo ID và ghi lại nhật ký kho hàng")
    public ResponseEntity<VariantResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStockRequest request,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(variantService.updateStock(id, request, userId != null ? userId : "system"));
    }

    @PatchMapping("/variants/{id}/price")
    @Operation(summary = "Cập nhật giá của biến thể", description = "Cập nhật giá bán của biến thể sản phẩm theo ID")
    public ResponseEntity<VariantResponse> updatePrice(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePriceRequest request) {
        return ResponseEntity.ok(variantService.updatePrice(id, request));
    }

    @GetMapping("/variants/{id}")
    @Operation(summary = "Lấy chi tiết biến thể", description = "Lấy thông tin chi tiết của một biến thể theo ID")
    public ResponseEntity<VariantResponse> getVariant(@PathVariable Long id) {
        return ResponseEntity.ok(variantService.findById(id));
    }
}
