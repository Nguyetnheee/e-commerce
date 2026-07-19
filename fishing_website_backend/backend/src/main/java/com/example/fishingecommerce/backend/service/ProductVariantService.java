package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateVariantRequest;
import com.example.fishingecommerce.backend.dto.request.UpdatePriceRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateStockRequest;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;

public interface ProductVariantService {
    VariantResponse createVariant(Long productId, CreateVariantRequest request);
    VariantResponse updateStock(Long variantId, UpdateStockRequest request, String updatedBy);
    VariantResponse updatePrice(Long variantId, UpdatePriceRequest request);
    VariantResponse findById(Long variantId);
    VariantResponse adjustStock(Long variantId, Integer quantityDelta, String reason, String updatedBy);
}
