package com.example.fishingecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Title", nullable = false)
    private String title;

    @Column(name = "Slug", unique = true)
    private String slug;

    @Column(name = "HtmlContent", columnDefinition = "LONGTEXT")
    private String htmlContent;

    @Column(name = "Author")
    private String author;

    @Column(name = "ImageUrl")
    private String imageUrl;

    @Column(name = "CategoryName")
    private String categoryName;

    @Column(name = "Terrain")
    private String terrain;

    @Column(name = "IsVisible")
    @Builder.Default
    private Boolean isVisible = true;

    @Column(name = "CreatedAt")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "UpdatedAt")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
