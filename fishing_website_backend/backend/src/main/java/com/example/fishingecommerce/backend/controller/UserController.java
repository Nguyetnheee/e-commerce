package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.UpdateProfileRequest;
import com.example.fishingecommerce.backend.dto.response.UserResponse;
import com.example.fishingecommerce.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Profile", description = "Quản lý thông tin cá nhân người dùng")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin hồ sơ cá nhân", description = "Lấy thông tin chi tiết hồ sơ cá nhân của người dùng đang đăng nhập")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());

        UserResponse profile = userService.getProfile(userId);

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật hồ sơ cá nhân", description = "Cập nhật thông tin chi tiết hồ sơ cá nhân của người dùng đang đăng nhập")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long userId = Long.valueOf(authentication.getName());
        
        UserResponse updatedProfile = userService.updateProfile(userId, request);
        
        return ResponseEntity.ok(updatedProfile);
    }
}
