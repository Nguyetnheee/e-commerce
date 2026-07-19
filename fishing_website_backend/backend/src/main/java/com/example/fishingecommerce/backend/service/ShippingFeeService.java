package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.ShippingFeeRequest;
import com.example.fishingecommerce.backend.dto.response.ShippingFeeResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ShippingFeeService {

    public ShippingFeeResponse calculateShippingFee(ShippingFeeRequest request) {
        int totalQuantity = request.getItems().stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();

        BigDecimal estimatedWeightKg = BigDecimal.valueOf(totalQuantity).multiply(BigDecimal.valueOf(0.5));

        return ShippingFeeResponse.builder()
                .shippingFee(BigDecimal.ZERO)
                .estimatedWeightKg(estimatedWeightKg)
                .build();
    }
}
