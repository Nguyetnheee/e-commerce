package com.example.fishingecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "WarehouseReceipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Code", unique = true, nullable = false)
    private String code;

    @Column(name = "SupplierName", nullable = false)
    private String supplierName;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "CreatedBy")
    private String createdBy;

    @Column(name = "CreatedAt")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "TotalQty")
    private Integer totalQty;

    @Column(name = "TotalValue", precision = 19, scale = 2)
    private BigDecimal totalValue;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WarehouseReceiptItem> items;
}
