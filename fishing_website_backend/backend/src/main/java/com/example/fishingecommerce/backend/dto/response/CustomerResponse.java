package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String email;
    private String fullname;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
    private UserAccountStatus status;
}
