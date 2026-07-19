package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateReturnRequest {
    @NotBlank
    private String orderId;

    @NotBlank
    private String customerName;

    @NotBlank
    private String productName;

    @NotNull
    private Long variantId;

    @NotBlank
    private String variantSku;

    @NotNull
    private Integer quantity;

    private String reason;

    private LocalDate date;
}
