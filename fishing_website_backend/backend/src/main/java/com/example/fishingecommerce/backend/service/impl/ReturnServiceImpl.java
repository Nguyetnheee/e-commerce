package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateReturnRequest;
import com.example.fishingecommerce.backend.dto.response.ReturnActionResponse;
import com.example.fishingecommerce.backend.dto.response.ReturnRequestResponse;
import com.example.fishingecommerce.backend.entity.ReturnRequest;
import com.example.fishingecommerce.backend.enums.ReturnRequestStatus;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.ReturnRequestRepository;
import com.example.fishingecommerce.backend.service.ProductVariantService;
import com.example.fishingecommerce.backend.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final ProductVariantService productVariantService;

    @Override
    public List<ReturnRequestResponse> findAll() {
        return returnRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public ReturnRequestResponse create(CreateReturnRequest request) {
        ReturnRequest returnRequest = ReturnRequest.builder()
                .code(generateCode())
                .orderId(request.getOrderId())
                .customerName(request.getCustomerName())
                .productName(request.getProductName())
                .variantId(request.getVariantId())
                .variantSku(request.getVariantSku())
                .quantity(request.getQuantity())
                .reason(request.getReason())
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .status(ReturnRequestStatus.PENDING_INSPECTION)
                .build();

        return mapToResponse(returnRequestRepository.save(returnRequest));
    }

    @Override
    @Transactional
    public ReturnActionResponse restock(String code) {
        ReturnRequest returnRequest = loadReturn(code);
        ensureActionable(returnRequest);

        if (returnRequest.getVariantId() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Return record is missing variantId");
        }

        var variantResponse = productVariantService.adjustStock(
                returnRequest.getVariantId(),
                returnRequest.getQuantity(),
                "Return restock " + returnRequest.getCode(),
                "warehouse"
        );

        returnRequest.setStatus(ReturnRequestStatus.RESTOCKED);
        returnRequestRepository.save(returnRequest);

        return ReturnActionResponse.builder()
                .returnId(returnRequest.getCode())
                .status(returnRequest.getStatus())
                .message("Product was restocked successfully.")
                .newStock(variantResponse.getStockQuantity())
                .build();
    }

    @Override
    @Transactional
    public ReturnActionResponse dispose(String code) {
        ReturnRequest returnRequest = loadReturn(code);
        ensureActionable(returnRequest);

        returnRequest.setStatus(ReturnRequestStatus.DISPOSED);
        returnRequestRepository.save(returnRequest);

        return ReturnActionResponse.builder()
                .returnId(returnRequest.getCode())
                .status(returnRequest.getStatus())
                .message("Product was disposed successfully.")
                .newStock(null)
                .build();
    }

    private void ensureActionable(ReturnRequest returnRequest) {
        if (returnRequest.getStatus() == ReturnRequestStatus.RESTOCKED || returnRequest.getStatus() == ReturnRequestStatus.DISPOSED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Return request has already been processed");
        }
    }

    private ReturnRequest loadReturn(String code) {
        return returnRequestRepository.findByCode(code)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Return request not found"));
    }

    private String generateCode() {
        long next = returnRequestRepository.countByCodeStartingWith("RET-") + 1;
        return String.format(Locale.ROOT, "RET-%03d", next);
    }

    private ReturnRequestResponse mapToResponse(ReturnRequest returnRequest) {
        return ReturnRequestResponse.builder()
                .id(returnRequest.getCode())
                .orderId(returnRequest.getOrderId())
                .customerName(returnRequest.getCustomerName())
                .productName(returnRequest.getProductName())
                .variantId(returnRequest.getVariantId())
                .variantSku(returnRequest.getVariantSku())
                .quantity(returnRequest.getQuantity())
                .reason(returnRequest.getReason())
                .date(returnRequest.getDate())
                .status(returnRequest.getStatus())
                .createdAt(returnRequest.getCreatedAt())
                .build();
    }
}
