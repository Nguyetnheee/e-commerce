package com.example.fishingecommerce.backend.dto.request;

import com.example.fishingecommerce.backend.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotNull
    private OrderStatus status;
}
