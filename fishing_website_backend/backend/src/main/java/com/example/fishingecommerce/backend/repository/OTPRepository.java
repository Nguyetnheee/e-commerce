package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.OTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findOTPByEmail(String userEmail);
}
