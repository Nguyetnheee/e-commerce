package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.WarehouseReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseReceiptRepository extends JpaRepository<WarehouseReceipt, Long> {
    List<WarehouseReceipt> findAllByOrderByCreatedAtDesc();
    Optional<WarehouseReceipt> findByCode(String code);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
