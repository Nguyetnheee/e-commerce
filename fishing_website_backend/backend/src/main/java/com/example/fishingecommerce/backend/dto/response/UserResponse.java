package com.example.fishingecommerce.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullname;
    private String email;
    private String address;
    private String phone;
    private String role;
    private String status;
    private String dob;
    private String gender;
    private LocalDateTime createdAt;
}
