package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ValidateCouponRequest {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String couponCode;

    @NotNull(message = "Giá trị đơn hàng không được để trống")
    private BigDecimal orderAmount;
}
