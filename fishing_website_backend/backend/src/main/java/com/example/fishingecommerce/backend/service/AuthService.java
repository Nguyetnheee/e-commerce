package com.example.fishingecommerce.backend.service;


import com.example.fishingecommerce.backend.dto.request.AdminLoginRequest;
import com.example.fishingecommerce.backend.dto.request.LoginRequest;
import com.example.fishingecommerce.backend.dto.request.NewPasswordRequest;
import com.example.fishingecommerce.backend.dto.request.RegisterRequest;
import com.example.fishingecommerce.backend.dto.request.RegisterStaffRequest;
import com.example.fishingecommerce.backend.dto.request.SetupFirstAdminRequest;
import com.example.fishingecommerce.backend.dto.response.LoginResponse;
import com.example.fishingecommerce.backend.dto.response.NewPasswordResponse;
import com.example.fishingecommerce.backend.dto.response.RegisterResponse;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);

    LoginResponse adminLogin(AdminLoginRequest loginRequest);

    RegisterResponse register(RegisterRequest registerRequest);

    LoginResponse emailLogin(String email,String fullname);

    NewPasswordResponse changePass(NewPasswordRequest request);

    LoginResponse setupFirstAdmin(SetupFirstAdminRequest request);

    LoginResponse registerStaff(RegisterStaffRequest request);
}
