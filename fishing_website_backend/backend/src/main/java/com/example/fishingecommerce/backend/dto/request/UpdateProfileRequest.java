package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "Fullname không được để trống")
    private String fullname;

    @NotBlank(message = "Phone không được để trống")
    private String phone;

    private String address;

    private String dob;

    private String gender;
}
