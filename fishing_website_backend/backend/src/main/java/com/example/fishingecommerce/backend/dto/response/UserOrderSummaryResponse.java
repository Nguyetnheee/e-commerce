package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class UserOrderSummaryResponse {
    private String orderCode;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}
