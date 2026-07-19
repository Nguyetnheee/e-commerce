package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDetailResponse {
    private Long id;
    private String customerEmail;
    private String recipientName;
    private String recipientPhone;
    private String shippingAddress;
    private String paymentMethod;
    private String couponCode;
    private PaymentStatus paymentStatus;
    private String checkoutUrl;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String cancelReason;
    private Long assignedShipperId;
    private String assignedShipperName;
    private String assignedShipperEmail;
    private String deliveryProofImage;
    private String codPaymentProofImage;
    private LocalDateTime deliveredAt;
    private LocalDateTime customerConfirmedAt;
    private String customerDeliveryReport;
    private LocalDateTime customerReportedAt;
    private String deliveryFailureReason;
    private LocalDateTime deliveryFailedAt;
    private Integer deliveryAttemptCount;
    private String trackingNumber;
    private LocalDateTime shippingLabelCreatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
    private List<ShippingEventResponse> shippingHistory;
}
