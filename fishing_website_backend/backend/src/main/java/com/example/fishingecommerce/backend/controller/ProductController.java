package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.response.ProductResponse;
import com.example.fishingecommerce.backend.dto.response.SearchResponse;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import com.example.fishingecommerce.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product (Public)", description = "Các API public cho khách hàng")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Lay danh sach san pham da xuat ban")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> materials,
            @RequestParam(required = false) List<String> actions,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "true") boolean isVisible,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        if (!isVisible) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productService.findPublishedProducts(categoryId, brandId, minPrice, maxPrice, materials, actions, sortBy, pageable));
    }

    @GetMapping("/promotions")
    @Operation(summary = "Lấy danh sách sản phẩm khuyến mãi", description = "Tìm các sản phẩm có ít nhất 1 biến thể đang giảm giá")
    public ResponseEntity<List<ProductResponse>> getPromotedProducts() {
        return ResponseEntity.ok(productService.getPromotedProducts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết sản phẩm", description = "Lấy thông tin mô tả, thông số kỹ thuật, hình ảnh của sản phẩm theo ID")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findPublishedById(id));
    }

    @GetMapping("/{id}/variants")
    @Operation(summary = "Lấy danh sách biến thể của sản phẩm", description = "Lấy danh sách kích thước, màu sắc của sản phẩm")
    public ResponseEntity<List<VariantResponse>> getVariantsByProductId(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getPublishedVariantsByProductId(id));
    }

    @GetMapping("/search/{keyword}")
    public ResponseEntity<SearchResponse> search(@PathVariable String keyword){
        return ResponseEntity.ok(productService.searchPublished(keyword));
    }
}
