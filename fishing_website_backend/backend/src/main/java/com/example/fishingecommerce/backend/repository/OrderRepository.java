package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    long countByStatus(OrderStatus status);
    List<Order> findByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime from, LocalDateTime to);
    List<Order> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
    List<Order> findByUserId(Long userId);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByAssignedShipperIdAndStatusOrderByCreatedAtAsc(Long shipperId, OrderStatus status);
    List<Order> findByAssignedShipperIdOrderByUpdatedAtDesc(Long shipperId);
    List<Order> findByStatusAndDeliveredAtLessThanEqual(OrderStatus status, LocalDateTime deliveredBefore);
}
