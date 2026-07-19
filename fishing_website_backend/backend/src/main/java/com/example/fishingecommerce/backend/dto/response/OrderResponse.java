package com.example.fishingecommerce.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String couponCode;
    private String recipientName;
    private String recipientPhone;
    private String shippingAddress;
    private String cancelReason;
    private LocalDateTime deliveredAt;
    private LocalDateTime customerConfirmedAt;
    private String customerDeliveryReport;
    private LocalDateTime customerReportedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
}
