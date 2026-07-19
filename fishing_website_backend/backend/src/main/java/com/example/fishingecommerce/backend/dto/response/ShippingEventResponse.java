package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShippingEventResponse {
    private Long id;
    private OrderStatus status;
    private String note;
    private String actor;
    private LocalDateTime createdAt;
}
