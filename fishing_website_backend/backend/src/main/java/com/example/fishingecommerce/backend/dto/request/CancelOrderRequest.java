package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelOrderRequest {
    @NotBlank
    private String reason;
}
