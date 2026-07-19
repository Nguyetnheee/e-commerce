package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateWarehouseReceiptRequest;
import com.example.fishingecommerce.backend.dto.request.WarehouseReceiptItemRequest;
import com.example.fishingecommerce.backend.dto.response.WarehouseReceiptItemResponse;
import com.example.fishingecommerce.backend.dto.response.WarehouseReceiptResponse;
import com.example.fishingecommerce.backend.dto.response.WarehouseReceiptSummaryResponse;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.entity.WarehouseReceipt;
import com.example.fishingecommerce.backend.entity.WarehouseReceiptItem;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import com.example.fishingecommerce.backend.repository.WarehouseReceiptRepository;
import com.example.fishingecommerce.backend.service.ProductVariantService;
import com.example.fishingecommerce.backend.service.WarehouseReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseReceiptServiceImpl implements WarehouseReceiptService {

    private final WarehouseReceiptRepository receiptRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductVariantService productVariantService;

    @Override
    @Transactional
    public WarehouseReceiptResponse create(CreateWarehouseReceiptRequest request, String createdBy) {
        String operator = createdBy != null && !createdBy.isBlank() ? createdBy : "system";
        String code = generateCode();

        WarehouseReceipt receipt = WarehouseReceipt.builder()
                .code(code)
                .supplierName(request.getSupplier())
                .notes(request.getNotes())
                .createdBy(operator)
                .totalQty(0)
                .totalValue(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        int totalQty = 0;
        BigDecimal totalValue = BigDecimal.ZERO;

        for (WarehouseReceiptItemRequest itemRequest : request.getItems()) {
            ProductVariant variant = variantRepository.findBySkuIgnoreCase(itemRequest.getSku())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Variant not found for SKU: " + itemRequest.getSku()));

            productVariantService.adjustStock(
                    variant.getId(),
                    itemRequest.getQty(),
                    "Warehouse receipt " + code + " - " + (itemRequest.getShelf() != null ? itemRequest.getShelf() : "no shelf"),
                    operator
            );

            totalQty += itemRequest.getQty();
            BigDecimal lineTotal = itemRequest.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQty()));
            totalValue = totalValue.add(lineTotal);

            WarehouseReceiptItem item = WarehouseReceiptItem.builder()
                    .receipt(receipt)
                    .sku(itemRequest.getSku())
                    .qty(itemRequest.getQty())
                    .price(itemRequest.getPrice())
                    .shelf(itemRequest.getShelf())
                    .build();
            receipt.getItems().add(item);
        }

        receipt.setTotalQty(totalQty);
        receipt.setTotalValue(totalValue);

        return mapToResponse(receiptRepository.save(receipt));
    }

    @Override
    public List<WarehouseReceiptSummaryResponse> findAll() {
        return receiptRepository.findAllByOrderByCreatedAtDesc().stream()
                .sorted(Comparator.comparing(WarehouseReceipt::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::mapToSummaryResponse)
                .toList();
    }

    @Override
    public WarehouseReceiptResponse findByCode(String code) {
        WarehouseReceipt receipt = receiptRepository.findByCode(code)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Warehouse receipt not found"));
        return mapToResponse(receipt);
    }

    private String generateCode() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.toLocalDate().atStartOfDay();
        LocalDateTime end = now.toLocalDate().atTime(LocalTime.MAX);
        long sequence = receiptRepository.countByCreatedAtBetween(start, end) + 1;
        return String.format("PNK-%s-%04d", now.format(DateTimeFormatter.BASIC_ISO_DATE), sequence);
    }

    private WarehouseReceiptSummaryResponse mapToSummaryResponse(WarehouseReceipt receipt) {
        return WarehouseReceiptSummaryResponse.builder()
                .code(receipt.getCode())
                .supplier(receipt.getSupplierName())
                .createdAt(receipt.getCreatedAt())
                .totalQty(receipt.getTotalQty())
                .totalValue(receipt.getTotalValue())
                .createdBy(receipt.getCreatedBy())
                .build();
    }

    private WarehouseReceiptResponse mapToResponse(WarehouseReceipt receipt) {
        return WarehouseReceiptResponse.builder()
                .code(receipt.getCode())
                .supplier(receipt.getSupplierName())
                .notes(receipt.getNotes())
                .createdBy(receipt.getCreatedBy())
                .createdAt(receipt.getCreatedAt())
                .totalQty(receipt.getTotalQty())
                .totalValue(receipt.getTotalValue())
                .items(receipt.getItems() != null
                        ? receipt.getItems().stream().map(this::mapItemToResponse).toList()
                        : List.of())
                .build();
    }

    private WarehouseReceiptItemResponse mapItemToResponse(WarehouseReceiptItem item) {
        return WarehouseReceiptItemResponse.builder()
                .sku(item.getSku())
                .qty(item.getQty())
                .price(item.getPrice())
                .shelf(item.getShelf())
                .build();
    }
}
