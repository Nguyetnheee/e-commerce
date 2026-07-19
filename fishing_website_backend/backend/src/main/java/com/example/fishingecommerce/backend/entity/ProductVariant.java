package com.example.fishingecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "ProductVariants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SKU")
    private String sku;

    @Column(name = "VariantName")
    private String variantName;

    @Column(name = "BasePrice")
    private BigDecimal basePrice;

    @Column(name = "DiscountPrice")
    private BigDecimal discountPrice;

    @Column(name = "StockQuantity")
    @Builder.Default
    private Integer stockQuantity = 0;

    @ManyToOne
    @JoinColumn(name = "ProductID")
    private Product product;

    @OneToMany(mappedBy = "variant")
    private List<InventoryLog> inventoryLogs;

    @OneToMany(mappedBy = "variant")
    private List<OrderItem> orderItems;
}
