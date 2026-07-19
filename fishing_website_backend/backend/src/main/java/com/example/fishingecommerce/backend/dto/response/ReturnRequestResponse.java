package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.ReturnRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ReturnRequestResponse {
    private String id;
    private String orderId;
    private String customerName;
    private String productName;
    private Long variantId;
    private String variantSku;
    private Integer quantity;
    private String reason;
    private LocalDate date;
    private ReturnRequestStatus status;
    private LocalDateTime createdAt;
}
