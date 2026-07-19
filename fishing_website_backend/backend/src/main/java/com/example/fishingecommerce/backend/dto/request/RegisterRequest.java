package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Fullname không được để trống")
    private String fullname;

    @NotBlank(message = "Email không được để trống")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$",
            message = "Email phải có đuôi @gmail.com")
    private String email;

    @NotBlank(message = "Password không được để trống")
    @Size(min = 5, message = "Mật khẩu phải bao gồm ít nhất 5 ký tự")
    private String password;
}
