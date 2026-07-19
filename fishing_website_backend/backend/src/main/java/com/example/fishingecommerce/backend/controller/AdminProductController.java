package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateProductRequest;
import com.example.fishingecommerce.backend.dto.request.CreateProductFullRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateProductStatusRequest;
import com.example.fishingecommerce.backend.dto.response.ProductResponse;
import com.example.fishingecommerce.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin Product", description = "Quản lý sản phẩm của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Tạo sản phẩm mới", description = "Tạo sản phẩm mới trên hệ thống kèm theo thông tin chi tiết")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PostMapping("/full")
    @Operation(
            summary = "Tạo sản phẩm kèm biến thể đầu tiên",
            description = "Tạo sản phẩm và biến thể đầu tiên trong cùng một request, giúp FE không cần gọi 2 API liên tiếp",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = CreateProductFullRequest.class),
                            examples = @ExampleObject(
                                    name = "ProductFull",
                                    value = """
                                            {
                                              "name": "Can cau Lure Bien Carbon",
                                              "code": "PROD-000123",
                                              "categoryId": 5,
                                              "brandId": 2,
                                              "supplierId": 1,
                                              "usageType": "BIEN",
                                              "description": "Mo ta chi tiet san pham...",
                                              "image": "/images/product-rod.png",
                                              "isVisible": true,
                                              "initialVariant": {
                                                "sku": "WS-PROD-7755B",
                                                "name": "Mac dinh",
                                                "basePrice": 5000000,
                                                "stockQuantity": 10
                                              }
                                            }
                                            """
                            )
                    )
            )
    )
    public ResponseEntity<ProductResponse> createProductFull(@Valid @RequestBody CreateProductFullRequest request) {
        return ResponseEntity.ok(productService.createProductFull(request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái sản phẩm", description = "Cập nhật trạng thái hiển thị/kinh doanh của sản phẩm")
    public ResponseEntity<ProductResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        return ResponseEntity.ok(productService.updateStatus(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin sản phẩm", description = "Lấy thông tin chi tiết của một sản phẩm theo ID")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }
}
