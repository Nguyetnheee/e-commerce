package com.example.fishingecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "InventoryLogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "VariantID")
    private ProductVariant variant;

    @Column(name = "QuantityChange")
    private Integer quantityChange;

    @Column(name = "PreviousStock")
    private Integer previousStock;

    @Column(name = "NewStock")
    private Integer newStock;

    @Column(name = "Reason")
    private String reason;

    @Column(name = "CreatedBy")
    private String createdBy;

    @Column(name = "CreatedAt")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
