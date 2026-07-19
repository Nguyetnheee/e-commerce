package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateAdminUserRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateRolesRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateUserStatusRequest;
import com.example.fishingecommerce.backend.dto.response.CustomerResponse;
import com.example.fishingecommerce.backend.dto.response.AdminUserResponse;
import com.example.fishingecommerce.backend.dto.response.UserDetailResponse;
import com.example.fishingecommerce.backend.dto.response.UserStatusUpdateResponse;

import java.util.List;

public interface AdminUserService {
    AdminUserResponse createAdminUser(CreateAdminUserRequest request);
    AdminUserResponse updateRoles(Long userId, UpdateRolesRequest request);
    List<AdminUserResponse> findAllAdmins();
    List<CustomerResponse> findAllCustomers();
    UserDetailResponse findUserDetail(Long userId);
    UserStatusUpdateResponse updateStatus(Long userId, UpdateUserStatusRequest request);
    void deleteUser(Long userId);
}
