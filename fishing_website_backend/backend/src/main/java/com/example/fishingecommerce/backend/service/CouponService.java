package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.ValidateCouponRequest;
import com.example.fishingecommerce.backend.dto.response.CouponValidationResponse;
import com.example.fishingecommerce.backend.entity.Coupon;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.CouponRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public CouponValidationResponse validateCoupon(ValidateCouponRequest request) {
        Coupon coupon = loadValidCoupon(request.getCouponCode(), request.getOrderAmount());
        BigDecimal discount = calculateDiscountAmount(coupon, request.getOrderAmount());
        BigDecimal finalAmount = request.getOrderAmount().subtract(discount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        return CouponValidationResponse.builder()
                .valid(true)
                .couponCode(coupon.getCode())
                .message("Mã giảm giá hợp lệ")
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .build();
    }

    public Coupon loadValidCoupon(String couponCode, BigDecimal subtotal) {
        if (couponCode == null || couponCode.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã giảm giá không được để trống");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Mã giảm giá không hợp lệ"));

        if (Boolean.FALSE.equals(coupon.getActive())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã bị vô hiệu hóa");
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn");
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá");
        }
        return coupon;
    }

    public BigDecimal calculateDiscountAmount(Coupon coupon, BigDecimal subtotal) {
        if (coupon == null || coupon.getDiscountValue() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        String discountType = coupon.getDiscountType() != null ? coupon.getDiscountType().toUpperCase(Locale.ROOT) : "PERCENT";
        if ("AMOUNT".equals(discountType)) {
            discount = coupon.getDiscountValue();
        } else {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), java.math.MathContext.DECIMAL64);
        }

        if (discount.compareTo(subtotal) > 0) {
            return subtotal;
        }
        return discount.max(BigDecimal.ZERO);
    }
}
