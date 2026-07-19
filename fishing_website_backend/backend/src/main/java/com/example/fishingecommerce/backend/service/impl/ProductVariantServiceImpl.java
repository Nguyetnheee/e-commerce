package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateVariantRequest;
import com.example.fishingecommerce.backend.dto.request.UpdatePriceRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateStockRequest;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import com.example.fishingecommerce.backend.entity.InventoryLog;
import com.example.fishingecommerce.backend.entity.Product;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.InventoryLogRepository;
import com.example.fishingecommerce.backend.repository.ProductRepository;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import com.example.fishingecommerce.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final InventoryLogRepository inventoryLogRepository;

    @Override
    @Transactional
    public VariantResponse createVariant(Long productId, CreateVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Product not found"));

        ProductVariant variant = ProductVariant.builder()
                .sku(request.getSku())
                .variantName(request.getVariantName())
                .basePrice(request.getBasePrice())
                .discountPrice(request.getDiscountPrice())
                .stockQuantity(request.getStockQuantity())
                .product(product)
                .build();

        ProductVariant saved = variantRepository.save(variant);
        logStockChange(saved, 0, request.getStockQuantity(), "Create new variant", "system");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public VariantResponse updateStock(Long variantId, UpdateStockRequest request, String updatedBy) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Variant not found"));

        Integer previousStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        Integer newStock = request.getStockQuantity();
        variant.setStockQuantity(newStock);

        ProductVariant saved = variantRepository.save(variant);
        logStockChange(saved, previousStock, newStock, request.getReason() != null ? request.getReason() : "Update stock", updatedBy);
        return mapToResponse(saved);
    }

    @Override
    public VariantResponse updatePrice(Long variantId, UpdatePriceRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Variant not found"));

        variant.setBasePrice(request.getBasePrice());
        variant.setDiscountPrice(request.getDiscountPrice());
        ProductVariant saved = variantRepository.save(variant);
        return mapToResponse(saved);
    }

    @Override
    public VariantResponse findById(Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Variant not found"));
        return mapToResponse(variant);
    }

    @Override
    @Transactional
    public VariantResponse adjustStock(Long variantId, Integer quantityDelta, String reason, String updatedBy) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Variant not found"));

        Integer previousStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        Integer newStock = previousStock + quantityDelta;
        if (newStock < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Inventory cannot be negative");
        }

        variant.setStockQuantity(newStock);
        ProductVariant saved = variantRepository.save(variant);
        logStockChange(saved, previousStock, newStock, reason != null ? reason : "Update stock", updatedBy);
        return mapToResponse(saved);
    }

    private void logStockChange(ProductVariant variant, Integer previousStock, Integer newStock, String reason, String updatedBy) {
        InventoryLog log = InventoryLog.builder()
                .variant(variant)
                .quantityChange(newStock - previousStock)
                .previousStock(previousStock)
                .newStock(newStock)
                .reason(reason)
                .createdBy(updatedBy)
                .build();
        inventoryLogRepository.save(log);
    }

    public static VariantResponse mapToResponse(ProductVariant variant) {
        return VariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getProduct() != null ? variant.getProduct().getId() : null)
                .sku(variant.getSku())
                .variantName(variant.getVariantName())
                .basePrice(variant.getBasePrice())
                .discountPrice(variant.getDiscountPrice())
                .stockQuantity(variant.getStockQuantity())
                .build();
    }
}
