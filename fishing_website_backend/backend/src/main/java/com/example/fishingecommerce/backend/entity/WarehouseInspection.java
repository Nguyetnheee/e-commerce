package com.example.fishingecommerce.backend.entity;

import com.example.fishingecommerce.backend.enums.WarehouseInspectionStatus;
import com.example.fishingecommerce.backend.enums.WarehouseInspectionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "WarehouseInspections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SupplierName", nullable = false)
    private String supplierName;

    @Enumerated(EnumType.STRING)
    @Column(name = "InspectType", nullable = false)
    private WarehouseInspectionType inspectType;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private WarehouseInspectionStatus status;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "QuantityMatched")
    private Boolean quantityMatched;

    @Column(name = "PackagingIntact")
    private Boolean packagingIntact;

    @Column(name = "ModelCorrect")
    private Boolean modelCorrect;

    @Column(name = "ConditionGood")
    private Boolean conditionGood;

    @Column(name = "AccessoriesIncluded")
    private Boolean accessoriesIncluded;

    @Column(name = "WarrantyCardIncluded")
    private Boolean warrantyCardIncluded;

    @Column(name = "RejectedQuantity")
    private Integer rejectedQuantity;

    @Column(name = "ReportedToAdmin")
    private Boolean reportedToAdmin;

    @Column(name = "CreatedAt")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
