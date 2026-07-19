package com.example.fishingecommerce.backend.entity;

import com.example.fishingecommerce.backend.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ShippingEvents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "OrderID", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private OrderStatus status;

    @Column(name = "Note", length = 500)
    private String note;

    @Column(name = "Actor", length = 100)
    private String actor;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
