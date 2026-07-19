package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterStaffRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String fullname;

    private String phone;

    @NotBlank
    private String role;

    @NotBlank
    private String adminSecretKey;
}
