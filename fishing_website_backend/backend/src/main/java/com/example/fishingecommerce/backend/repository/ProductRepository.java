package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.Product;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    java.util.Optional<Product> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByBrand_Id(Long brandId);
    boolean existsByCategory_Id(Long categoryId);
    long countByBrand_Id(Long brandId);
    long countByCategory_Id(Long categoryId);

    @Query("SELECT DISTINCT p FROM Product p JOIN p.variants v WHERE v.discountPrice IS NOT NULL AND v.discountPrice < v.basePrice AND p.isVisible = true")
    List<Product> findPromotedProducts();

    List<Product> findAllByNameContainingIgnoreCase(String name);

    List<Product> findAllByNameContainingIgnoreCaseAndIsVisibleTrue(String name);

    java.util.Optional<Product> findByIdAndIsVisibleTrue(Long id);

    @Query("""
            SELECT p FROM Product p
            WHERE p.isVisible = true
              AND (:categoryId IS NULL OR p.category.id = :categoryId)
              AND (:brandId IS NULL OR p.brand.id = :brandId)
            """)
    Page<Product> findPublishedProducts(
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            Pageable pageable);

    @Query("""
            SELECT DISTINCT p FROM Product p
            WHERE p.isVisible = true
              AND (:categoryId IS NULL OR p.category.id = :categoryId)
              AND (:brandId IS NULL OR p.brand.id = :brandId)
              AND (:materials IS NULL OR p.material IN :materials)
              AND (:actions IS NULL OR p.action IN :actions)
              AND (
                    (:minPrice IS NULL AND :maxPrice IS NULL)
                    OR EXISTS (
                        SELECT v.id FROM ProductVariant v
                        WHERE v.product = p
                          AND (:minPrice IS NULL OR COALESCE(v.discountPrice, v.basePrice) >= :minPrice)
                          AND (:maxPrice IS NULL OR COALESCE(v.discountPrice, v.basePrice) <= :maxPrice)
                    )
              )
            """)
    List<Product> findPublishedProductsFiltered(
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            @Param("materials") List<String> materials,
            @Param("actions") List<String> actions);
}
