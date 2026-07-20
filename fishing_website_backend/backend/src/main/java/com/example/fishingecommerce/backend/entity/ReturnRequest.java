package com.example.fishingecommerce.backend.entity;

import com.example.fishingecommerce.backend.enums.ReturnRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ProductReturns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Code", unique = true, nullable = false)
    private String code;

    @Column(name = "OrderId")
    private String orderId;

    @Column(name = "CustomerName")
    private String customerName;

    @Column(name = "ProductName")
    private String productName;

    @Column(name = "VariantId")
    private Long variantId;

    @Column(name = "VariantSku")
    private String variantSku;

    @Column(name = "Quantity")
    private Integer quantity;

    @Column(name = "Reason")
    private String reason;

    @Column(name = "RefundAmount", precision = 12, scale = 2)
    private java.math.BigDecimal refundAmount;

    @Column(name = "BankName")
    private String bankName;

    @Column(name = "BankAccount")
    private String bankAccount;

    @Column(name = "BankHolder")
    private String bankHolder;

    @Column(name = "InspectionNote")
    private String inspectionNote;

    @Column(name = "ReturnDate")
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    @Builder.Default
    private ReturnRequestStatus status = ReturnRequestStatus.PENDING_INSPECTION;

    @Column(name = "CreatedAt")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "UpdatedAt")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
