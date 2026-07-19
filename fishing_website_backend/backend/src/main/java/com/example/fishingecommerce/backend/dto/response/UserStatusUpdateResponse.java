package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatusUpdateResponse {
    private Long userId;
    private UserAccountStatus status;
    private String message;
}
