package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.LoginRequest;
import com.example.fishingecommerce.backend.dto.request.NewPasswordRequest;
import com.example.fishingecommerce.backend.dto.request.RegisterRequest;
import com.example.fishingecommerce.backend.dto.response.LoginResponse;
import com.example.fishingecommerce.backend.dto.response.NewPasswordResponse;
import com.example.fishingecommerce.backend.dto.response.RegisterResponse;
import com.example.fishingecommerce.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Quản lý đăng ký, đăng nhập và xác thực của người dùng/khách hàng")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Đăng ký tài khoản người dùng mới")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest registerRequest){
        RegisterResponse registerResponse = authService.register(registerRequest);
        return ResponseEntity.ok(registerResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập tài khoản", description = "Đăng nhập bằng email và mật khẩu để nhận JWT token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(authService.login(loginRequest));
    }

//    @GetMapping("/google")
//    @Operation(summary = "Đăng nhập Google OAuth2", description = "Xác thực qua Google OAuth2")
//    public ResponseEntity<LoginResponse> mail(
//            @AuthenticationPrincipal OAuth2User user
//    ) {
//        String email = user.getAttribute("email");
//        String fullname = user.getAttribute("name");
//        return ResponseEntity.ok(authService.emailLogin(email,fullname));
//    }

    @PostMapping("/change-passwword")
    public ResponseEntity<NewPasswordResponse> changePass(@Valid @RequestBody NewPasswordRequest request){
        return ResponseEntity.ok(authService.changePass(request));
    }
}
