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
                .refundAmount(request.getRefundAmount())
                .bankName(request.getBankName())
                .bankAccount(request.getBankAccount())
                .bankHolder(request.getBankHolder())
                .date(request.getDate() != null ? request.getDate() : LocalDate.now())
                .status(request.getBankName() != null && !request.getBankName().isBlank() ? ReturnRequestStatus.PENDING_APPROVAL : ReturnRequestStatus.PENDING_INSPECTION)
                .build();

        return mapToResponse(returnRequestRepository.save(returnRequest));
    }

    @Override
    @Transactional
    public ReturnActionResponse approve(String code) {
        ReturnRequest returnRequest = loadReturn(code);
        returnRequest.setStatus(ReturnRequestStatus.APPROVED);
        returnRequestRepository.save(returnRequest);

        return ReturnActionResponse.builder()
                .returnId(returnRequest.getCode())
                .status(returnRequest.getStatus())
                .message("Return request approved by admin.")
                .build();
    }

    @Override
    @Transactional
    public ReturnActionResponse reject(String code, String reason) {
        ReturnRequest returnRequest = loadReturn(code);
        returnRequest.setStatus(ReturnRequestStatus.REJECTED);
        if (reason != null && !reason.isBlank()) {
            returnRequest.setInspectionNote(reason);
        }
        returnRequestRepository.save(returnRequest);

        return ReturnActionResponse.builder()
                .returnId(returnRequest.getCode())
                .status(returnRequest.getStatus())
                .message("Return request rejected by admin.")
                .build();
    }

    @Override
    @Transactional
    public ReturnActionResponse refund(String code) {
        ReturnRequest returnRequest = loadReturn(code);
        returnRequest.setStatus(ReturnRequestStatus.REFUNDED);
        returnRequestRepository.save(returnRequest);

        return ReturnActionResponse.builder()
                .returnId(returnRequest.getCode())
                .status(returnRequest.getStatus())
                .message("Bank transfer refund completed successfully.")
                .build();
    }

    @Override
    @Transactional
    public ReturnActionResponse restock(String code) {
        ReturnRequest returnRequest = loadReturn(code);

        if (returnRequest.getVariantId() != null) {
            var variantResponse = productVariantService.adjustStock(
                    returnRequest.getVariantId(),
                    returnRequest.getQuantity() != null ? returnRequest.getQuantity() : 1,
                    "Return restock " + returnRequest.getCode(),
                    "warehouse"
            );
            returnRequest.setStatus(ReturnRequestStatus.RESTOCKED);
            returnRequestRepository.save(returnRequest);

            return ReturnActionResponse.builder()
                    .returnId(returnRequest.getCode())
                    .status(returnRequest.getStatus())
                    .message("Product was inspected & restocked successfully into DB.")
                    .newStock(variantResponse.getStockQuantity())
                    .build();
        }

        returnRequest.setStatus(ReturnRequestStatus.RESTOCKED);
        returnRequestRepository.save(returnRequest);
        return ReturnActionResponse.builder()
                .returnId(returnRequest.getCode())
                .status(returnRequest.getStatus())
                .message("Return record marked as restocked.")
                .build();
    }

    @Override
    @Transactional
    public ReturnActionResponse dispose(String code) {
        ReturnRequest returnRequest = loadReturn(code);

        returnRequest.setStatus(ReturnRequestStatus.DISPOSED);
        returnRequest.setInspectionNote("Hàng lưu kho bị hư hỏng / Tiêu hủy theo chính sách 17.6");
        returnRequestRepository.save(returnRequest);

        return ReturnActionResponse.builder()
                .returnId(returnRequest.getCode())
                .status(returnRequest.getStatus())
                .message("Product marked as damaged stock / disposed.")
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
                .refundAmount(returnRequest.getRefundAmount())
                .bankName(returnRequest.getBankName())
                .bankAccount(returnRequest.getBankAccount())
                .bankHolder(returnRequest.getBankHolder())
                .inspectionNote(returnRequest.getInspectionNote())
                .date(returnRequest.getDate())
                .status(returnRequest.getStatus())
                .createdAt(returnRequest.getCreatedAt())
                .build();
    }
}
