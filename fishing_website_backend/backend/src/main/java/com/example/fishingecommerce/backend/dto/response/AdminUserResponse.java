package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String fullname;
    private String email;
    private Set<String> roles;
    private String status;
    private LocalDateTime createdAt;
}
