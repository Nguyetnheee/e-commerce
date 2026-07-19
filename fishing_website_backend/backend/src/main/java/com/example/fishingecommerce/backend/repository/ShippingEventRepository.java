package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.ShippingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShippingEventRepository extends JpaRepository<ShippingEvent, Long> {
    List<ShippingEvent> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
