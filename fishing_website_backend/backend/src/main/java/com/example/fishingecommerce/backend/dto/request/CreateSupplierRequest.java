package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSupplierRequest {
    @NotBlank
    private String name;

    private String phone;
    private String email;
    private String address;
    private String productsProvided;
}
