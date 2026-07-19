package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {
    List<InventoryLog> findByVariantId(Long variantId);
    List<InventoryLog> findByVariantIdAndCreatedAtBetween(Long variantId, LocalDateTime from, LocalDateTime to);
}
