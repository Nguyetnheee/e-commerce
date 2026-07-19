package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.ValidateCouponRequest;
import com.example.fishingecommerce.backend.dto.response.CouponValidationResponse;
import com.example.fishingecommerce.backend.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupon", description = "Kiểm tra và áp dụng mã giảm giá")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    @Operation(summary = "Kiểm tra mã giảm giá", description = "Xác thực mã giảm giá và tính giá trị giảm")
    public ResponseEntity<CouponValidationResponse> validate(@Valid @RequestBody ValidateCouponRequest request) {
        return ResponseEntity.ok(couponService.validateCoupon(request));
    }
}
