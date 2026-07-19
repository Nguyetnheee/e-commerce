package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByCode(String code);
    Optional<Supplier> findByNameIgnoreCase(String name);
    boolean existsByCode(String code);
}
