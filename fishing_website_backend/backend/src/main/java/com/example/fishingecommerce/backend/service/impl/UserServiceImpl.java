package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.UpdateProfileRequest;
import com.example.fishingecommerce.backend.dto.response.UserResponse;
import com.example.fishingecommerce.backend.entity.User;
import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.exceptions.ResourceNotFoundException;
import com.example.fishingecommerce.backend.repository.UserRepository;
import com.example.fishingecommerce.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getStatus() != null && user.getStatus() != UserAccountStatus.ACTIVE) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tai khoan hien khong hoat dong");
        }

        user.setFullname(request.getFullname());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setDob(request.getDob());
        user.setGender(request.getGender());

        return mapToResponse(userRepository.save(user));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .address(user.getAddress())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .dob(user.getDob())
                .gender(user.getGender())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
