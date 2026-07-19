package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.Brand;
import com.example.fishingecommerce.backend.enums.Locations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findAllByOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);

    @Query("""
            SELECT DISTINCT b FROM Brand b
            JOIN b.products p
            WHERE (:categoryId IS NULL OR p.category.id = :categoryId)
              AND (:location IS NULL OR p.location = :location)
            ORDER BY b.name ASC
            """)
    List<Brand> findAvailableBrands(
            @Param("categoryId") Long categoryId,
            @Param("location") Locations location);
}
