package com.example.fishingecommerce.backend.config;

import com.example.fishingecommerce.backend.entity.Coupon;
import com.example.fishingecommerce.backend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class CouponInitializer {

    @Bean
    public CommandLineRunner initCoupons(CouponRepository couponRepository) {
        return args -> {
            if (couponRepository.findByCodeIgnoreCase("WILD15").isEmpty()) {
                couponRepository.save(Coupon.builder()
                        .code("WILD15")
                        .discountType("PERCENT")
                        .discountValue(BigDecimal.valueOf(15))
                        .minOrderAmount(BigDecimal.valueOf(500000))
                        .active(true)
                        .expiresAt(LocalDateTime.now().plusYears(1))
                        .build());
            }
        };
    }
}
