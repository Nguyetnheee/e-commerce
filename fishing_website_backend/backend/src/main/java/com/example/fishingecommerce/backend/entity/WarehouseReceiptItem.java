package com.example.fishingecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "WarehouseReceiptItems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseReceiptItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReceiptID")
    private WarehouseReceipt receipt;

    @Column(name = "SKU", nullable = false)
    private String sku;

    @Column(name = "Qty", nullable = false)
    private Integer qty;

    @Column(name = "Price", precision = 19, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "Shelf")
    private String shelf;
}
