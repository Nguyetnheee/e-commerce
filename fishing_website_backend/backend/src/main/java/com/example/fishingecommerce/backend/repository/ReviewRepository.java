package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductId(Long productId, Pageable pageable);
    boolean existsByOrderIdAndProductIdAndUserId(Long orderId, Long productId, Long userId);
    List<Review> findByUserId(Long userId);
}
