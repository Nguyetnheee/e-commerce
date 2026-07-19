package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long userId;
    private String email;
    private String fullname;
    private String token;
    private UserRole role;
}
