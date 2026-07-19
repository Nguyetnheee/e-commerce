package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.AdminLoginRequest;
import com.example.fishingecommerce.backend.dto.request.RegisterStaffRequest;
import com.example.fishingecommerce.backend.dto.request.SetupFirstAdminRequest;
import com.example.fishingecommerce.backend.dto.response.LoginResponse;
import com.example.fishingecommerce.backend.service.AuthService;
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
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
@Tag(name = "Admin Authentication", description = "Quản lý đăng nhập và xác thực của Quản trị viên")
public class AdminAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập Admin", description = "Xác thực tài khoản admin và trả về JWT token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(authService.adminLogin(request));
    }

    @PostMapping("/setup-first-admin")
    @Operation(summary = "Setup first admin", description = "Khoi tao admin dau tien khi database chua co admin")
    public ResponseEntity<LoginResponse> setupFirstAdmin(@Valid @RequestBody SetupFirstAdminRequest request) {
        return ResponseEntity.ok(authService.setupFirstAdmin(request));
    }

    @PostMapping("/register-staff")
    @Operation(summary = "Register staff", description = "Tao tai khoan admin/nhan su bang secret key")
    public ResponseEntity<LoginResponse> registerStaff(@Valid @RequestBody RegisterStaffRequest request) {
        return ResponseEntity.ok(authService.registerStaff(request));
    }
}
