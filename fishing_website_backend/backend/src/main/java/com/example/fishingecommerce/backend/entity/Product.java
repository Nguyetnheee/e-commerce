package com.example.fishingecommerce.backend.entity;

import com.example.fishingecommerce.backend.enums.Locations;
import com.example.fishingecommerce.backend.enums.ProductUsageType;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.Set;

@Entity
@Table(name = "Products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Name")
    private String name;

    @Column(name = "Image")
    private String image;

    @Column(name = "Description")
    private String description;

    @Column(name = "Material")
    private String material;

    @Column(name = "Action")
    private String action;

    @Column(name = "Code")
    private String code;

    @Column(name = "Stock")
    private Integer stock;

    @Column(name = "IsVisible")
    @Builder.Default
    private Boolean isVisible = true;

    @ManyToOne
    @JoinColumn(name = "CatID")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "BrandID")
    private Brand brand;

    @ManyToOne
    @JoinColumn(name = "SupplierID")
    private Supplier supplier;

    @Column(name = "time", nullable = false)
    private Long time;

    @ManyToMany
    @JoinTable(
            name = "ProductTags",
            joinColumns = @JoinColumn(name = "ProductID"),
            inverseJoinColumns = @JoinColumn(name = "TagID")
    )
    private Set<Tag> tags;

    @Column(name = "Location")
    private Locations location;

    @Enumerated(EnumType.STRING)
    @Column(name = "UsageType")
    private ProductUsageType usageType;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductVariant> variants;

    @PrePersist
    public void prePersist() {
        if (this.time == null) {
            this.time = System.currentTimeMillis();
        }
    }
}
