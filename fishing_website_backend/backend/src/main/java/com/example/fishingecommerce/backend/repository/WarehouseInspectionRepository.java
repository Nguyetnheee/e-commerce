package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.WarehouseInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarehouseInspectionRepository extends JpaRepository<WarehouseInspection, Long> {
}
