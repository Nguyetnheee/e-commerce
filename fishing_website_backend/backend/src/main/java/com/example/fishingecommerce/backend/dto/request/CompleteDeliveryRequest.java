package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompleteDeliveryRequest {
    @NotBlank
    private String proofImageUrl;

    private String codPaymentProofImageUrl;
}
