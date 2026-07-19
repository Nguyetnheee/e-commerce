package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentStatusResponse {
    private String orderCode;
    private PaymentStatus paymentStatus;
}
