package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.EmailRequest;
import com.example.fishingecommerce.backend.dto.request.OTPVerificationRequest;
import com.example.fishingecommerce.backend.dto.response.EmailResponse;
import com.example.fishingecommerce.backend.dto.response.OTPVerificationResponse;
import com.example.fishingecommerce.backend.service.OTPService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class OTPController {
    @Autowired
    private OTPService OTPService;
    @PostMapping("/otp/request")
    public ResponseEntity<EmailResponse> sendOTP(@Valid @RequestBody EmailRequest emailRequest){
        return ResponseEntity.ok(OTPService.sendOTP(emailRequest));
    }
    @PostMapping("/otp/verify")
    public ResponseEntity<OTPVerificationResponse> verifyOTP(@Valid @RequestBody OTPVerificationRequest emailRequest){
        return ResponseEntity.ok(OTPService.verifyOtp(emailRequest));
    }


}

