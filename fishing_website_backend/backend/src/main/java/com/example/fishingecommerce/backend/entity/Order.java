package com.example.fishingecommerce.backend.entity;

import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "UserID")
    private User user;

    @Column(name = "OrderCode", unique = true)
    private String orderCode;

    @Column(name = "Status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "TotalAmount")
    private BigDecimal totalAmount;

    @Column(name = "RecipientName")
    private String recipientName;

    @Column(name = "RecipientPhone")
    private String recipientPhone;

    @Column(name = "ShippingAddress")
    private String shippingAddress;

    @Column(name = "PaymentMethod")
    private String paymentMethod;

    @Column(name = "CouponCode")
    private String couponCode;

    @Column(name = "DiscountAmount", precision = 19, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "PaymentStatus")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "PaymentLinkUrl", length = 1000)
    private String paymentLinkUrl;

    @Column(name = "CancelReason")
    private String cancelReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AssignedShipperID")
    private User assignedShipper;

    @Column(name = "DeliveryProofImage", length = 1000)
    private String deliveryProofImage;

    @Column(name = "DeliveredAt")
    private LocalDateTime deliveredAt;

    @Column(name = "DeliveryFailureReason", length = 500)
    private String deliveryFailureReason;

    @Column(name = "DeliveryFailedAt")
    private LocalDateTime deliveryFailedAt;

    @Column(name = "DeliveryAttemptCount")
    @Builder.Default
    private Integer deliveryAttemptCount = 0;

    @Column(name = "TrackingNumber", unique = true, updatable = false)
    private String trackingNumber;

    @Column(name = "ShippingLabelCreatedAt", updatable = false)
    private LocalDateTime shippingLabelCreatedAt;

    @Column(name = "CreatedAt")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "UpdatedAt")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @PrePersist
    protected void onCreate() {
        if (this.orderCode == null) {
            this.orderCode = "DH" + System.currentTimeMillis();
        }
        if (this.status == null) {
            this.status = OrderStatus.PENDING;
        }
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.PENDING;
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
