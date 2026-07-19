package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SupplierResponse {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String productsProvided;
    private LocalDateTime createdAt;
}
