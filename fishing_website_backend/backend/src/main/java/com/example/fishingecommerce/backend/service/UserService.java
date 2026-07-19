package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.UpdateProfileRequest;
import com.example.fishingecommerce.backend.dto.response.UserResponse;

public interface UserService {
    UserResponse getProfile(Long userId);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
}
