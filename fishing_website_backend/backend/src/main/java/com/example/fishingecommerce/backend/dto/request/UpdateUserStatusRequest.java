package com.example.fishingecommerce.backend.dto.request;

import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {
    @NotNull
    private UserAccountStatus status;

    private String reason;
}
