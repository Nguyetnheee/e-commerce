package com.example.fishingecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Code", unique = true, nullable = false)
    private String code;

    @Column(name = "DiscountType", nullable = false)
    private String discountType;

    @Column(name = "DiscountValue", nullable = false, precision = 19, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "MinOrderAmount", precision = 19, scale = 2)
    private BigDecimal minOrderAmount;

    @Column(name = "IsActive")
    @Builder.Default
    private Boolean active = true;

    @Column(name = "ExpiresAt")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        if (this.active == null) {
            this.active = true;
        }
    }
}
