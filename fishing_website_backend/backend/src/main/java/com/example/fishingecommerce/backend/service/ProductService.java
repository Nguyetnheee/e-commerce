package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateProductRequest;
import com.example.fishingecommerce.backend.dto.request.CreateProductFullRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateProductStatusRequest;
import com.example.fishingecommerce.backend.dto.response.ProductResponse;
import com.example.fishingecommerce.backend.dto.response.SearchResponse;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse createProductFull(CreateProductFullRequest request);
    ProductResponse updateStatus(Long productId, UpdateProductStatusRequest request);
    ProductResponse findById(Long productId);
    ProductResponse findPublishedById(Long productId);
    SearchResponse search(String keyword);
    SearchResponse searchPublished(String keyword);
    Page<ProductResponse> findPublishedProducts(
            Long categoryId,
            Long brandId,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            java.util.List<String> materials,
            java.util.List<String> actions,
            String sortBy,
            Pageable pageable);
    java.util.List<ProductResponse> getPromotedProducts();
    java.util.List<VariantResponse> getVariantsByProductId(Long productId);
    java.util.List<VariantResponse> getPublishedVariantsByProductId(Long productId);
}
