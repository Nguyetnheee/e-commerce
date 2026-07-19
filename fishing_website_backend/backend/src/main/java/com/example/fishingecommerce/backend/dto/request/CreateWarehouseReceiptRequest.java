package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateWarehouseReceiptRequest {
    @NotBlank
    private String supplier;

    private String notes;

    @NotEmpty
    @Valid
    private List<WarehouseReceiptItemRequest> items;
}
