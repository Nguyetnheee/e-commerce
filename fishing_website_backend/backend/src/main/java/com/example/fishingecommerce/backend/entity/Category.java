package com.example.fishingecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "Categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Name")
    private String name;

    @Column(name = "SubCategories")
    private String subCategories;

    @Column(name = "SortOrder")
    @Builder.Default
    private Integer sortOrder = 0;

    @ManyToOne
    @JoinColumn(name = "ParentID")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Category> children;

    @OneToMany(mappedBy = "category")
    private List<Product> products;
}
