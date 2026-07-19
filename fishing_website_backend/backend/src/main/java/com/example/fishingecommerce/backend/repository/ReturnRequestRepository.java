package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.ReturnRequest;
import com.example.fishingecommerce.backend.enums.ReturnRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
    List<ReturnRequest> findByStatusOrderByCreatedAtDesc(ReturnRequestStatus status);
    Optional<ReturnRequest> findByCode(String code);
    long countByCodeStartingWith(String prefix);
}
