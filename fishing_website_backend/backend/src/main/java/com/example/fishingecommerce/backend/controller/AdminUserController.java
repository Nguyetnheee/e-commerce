package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateAdminUserRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateRolesRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateUserStatusRequest;
import com.example.fishingecommerce.backend.dto.response.CustomerResponse;
import com.example.fishingecommerce.backend.dto.response.AdminUserResponse;
import com.example.fishingecommerce.backend.dto.response.UserDetailResponse;
import com.example.fishingecommerce.backend.dto.response.UserStatusUpdateResponse;
import com.example.fishingecommerce.backend.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User", description = "Quản lý tài khoản quản trị/nhân viên của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Lấy tất cả tài khoản quản trị", description = "Lấy danh sách tất cả tài khoản Admin, Manager, Approver")
    public ResponseEntity<List<AdminUserResponse>> getAllAdmins() {
        return ResponseEntity.ok(adminUserService.findAllAdmins());
    }

    @GetMapping("/customers")
    @Operation(summary = "Lấy danh sách khách hàng", description = "Lấy danh sách tài khoản khách mua hàng")
    public ResponseEntity<List<CustomerResponse>> getCustomers() {
        return ResponseEntity.ok(adminUserService.findAllCustomers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết user", description = "Lấy thông tin chi tiết của một người dùng bất kỳ")
    public ResponseEntity<UserDetailResponse> getUserDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.findUserDetail(id));
    }

    @PostMapping
    @Operation(summary = "Tạo tài khoản quản trị mới", description = "Tạo tài khoản quản trị mới kèm theo phân quyền")
    public ResponseEntity<AdminUserResponse> createAdminUser(@Valid @RequestBody CreateAdminUserRequest request) {
        return ResponseEntity.ok(adminUserService.createAdminUser(request));
    }

    @PutMapping("/{id}/roles")
    @Operation(summary = "Cập nhật quyền tài khoản quản trị", description = "Cập nhật vai trò/quyền hạn của một tài khoản quản trị theo ID")
    public ResponseEntity<AdminUserResponse> updateRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRolesRequest request) {
        return ResponseEntity.ok(adminUserService.updateRoles(id, request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Khóa/Mở khóa user", description = "Cập nhật trạng thái tài khoản người dùng")
    public ResponseEntity<UserStatusUpdateResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminUserService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa user", description = "Xóa vĩnh viễn tài khoản người dùng")
    public ResponseEntity<java.util.Map<String, String>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Da xoa tai khoan ID " + id + " thanh cong khoi he thong."));
    }
}
