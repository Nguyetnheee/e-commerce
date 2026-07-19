package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignShipperRequest {
    @NotNull
    private Long shipperId;
}
