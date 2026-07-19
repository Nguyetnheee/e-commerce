package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateAdminUserRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateRolesRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateUserStatusRequest;
import com.example.fishingecommerce.backend.dto.response.AdminUserResponse;
import com.example.fishingecommerce.backend.dto.response.CustomerResponse;
import com.example.fishingecommerce.backend.dto.response.UserDetailResponse;
import com.example.fishingecommerce.backend.dto.response.UserOrderSummaryResponse;
import com.example.fishingecommerce.backend.dto.response.UserStatusUpdateResponse;
import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.entity.Role;
import com.example.fishingecommerce.backend.entity.User;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import com.example.fishingecommerce.backend.enums.UserRole;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.CartItemRepository;
import com.example.fishingecommerce.backend.repository.OTPRepository;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.repository.ReviewRepository;
import com.example.fishingecommerce.backend.repository.RoleRepository;
import com.example.fishingecommerce.backend.repository.UserRepository;
import com.example.fishingecommerce.backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private static final Set<String> ADMIN_ROLE_NAMES = Set.of("ADMIN", "MANAGER", "APPROVER");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final OTPRepository otpRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public AdminUserResponse createAdminUser(CreateAdminUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email da ton tai");
        }

        Set<Role> roles = resolveRoles(request.getRoleIds());
        String primaryRole = resolvePrimaryRoleName(roles);

        User user = User.builder()
                .fullname(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.valueOf(primaryRole))
                .status(UserAccountStatus.ACTIVE)
                .roles(roles)
                .build();

        return mapToAdminResponse(userRepository.save(user));
    }

    @Override
    public AdminUserResponse updateRoles(Long userId, UpdateRolesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung"));

        Set<Role> roles = resolveRoles(request.getRoleIds());
        user.setRoles(roles);
        user.setRole(UserRole.valueOf(resolvePrimaryRoleName(roles)));
        return mapToAdminResponse(userRepository.save(user));
    }

    @Override
    public List<AdminUserResponse> findAllAdmins() {
        return userRepository.findAll().stream()
                .filter(this::isAdminAccount)
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CustomerResponse> findAllCustomers() {
        return userRepository.findByRole(UserRole.USER).stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserDetailResponse findUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung"));

        List<Order> orders = orderRepository.findByUserId(userId);
        List<UserOrderSummaryResponse> recentOrders = orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(3)
                .map(order -> UserOrderSummaryResponse.builder()
                        .orderCode(order.getOrderCode())
                        .status(order.getStatus())
                        .totalAmount(order.getTotalAmount())
                        .createdAt(order.getCreatedAt())
                        .build())
                .toList();

        BigDecimal totalSpent = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return UserDetailResponse.builder()
                .id(user.getId())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .dob(user.getDob())
                .gender(user.getGender())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .orderCount(orders.size())
                .totalSpent(totalSpent)
                .recentOrders(recentOrders)
                .build();
    }

    @Override
    @Transactional
    public UserStatusUpdateResponse updateStatus(Long userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung"));

        user.setStatus(request.getStatus());
        userRepository.save(user);

        String message = switch (request.getStatus()) {
            case ACTIVE -> "Da mo khoa tai khoan thanh cong.";
            case LOCKED -> "Da khoa tai khoan thanh cong.";
            case DISABLED -> "Da vo hieu hoa tai khoan thanh cong.";
        };

        return UserStatusUpdateResponse.builder()
                .userId(user.getId())
                .status(user.getStatus())
                .message(message)
                .build();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay nguoi dung"));

        orderRepository.deleteAll(orderRepository.findByUserId(userId));
        reviewRepository.deleteAll(reviewRepository.findByUserId(userId));
        cartItemRepository.deleteAll(cartItemRepository.findByUserId(userId));
        otpRepository.findOTPByEmail(user.getEmail()).ifPresent(otpRepository::delete);
        userRepository.delete(user);
    }

    private boolean isAdminAccount(User user) {
        if (user.getRole() != null && ADMIN_ROLE_NAMES.contains(user.getRole().name())) {
            return true;
        }
        return user.getRoles() != null
                && user.getRoles().stream().map(Role::getName).anyMatch(ADMIN_ROLE_NAMES::contains);
    }

    private Set<Role> resolveRoles(Set<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) {
            Role manager = roleRepository.findByName("MANAGER")
                    .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Role MANAGER chua duoc khoi tao"));
            return Set.of(manager);
        }
        return new HashSet<>(roleRepository.findAllById(roleIds));
    }

    private String resolvePrimaryRoleName(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return UserRole.MANAGER.name();
        }

        Set<String> roleNames = roles.stream().map(Role::getName).collect(Collectors.toSet());
        if (roleNames.contains("ADMIN")) {
            return UserRole.ADMIN.name();
        }
        if (roleNames.contains("MANAGER")) {
            return UserRole.MANAGER.name();
        }
        return UserRole.MANAGER.name();
    }

    private AdminUserResponse mapToAdminResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .roles(user.getRoles() != null
                        ? user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
                        : Set.of())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }

    private CustomerResponse mapToCustomerResponse(User user) {
        return CustomerResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .phone(user.getPhone())
                .address(user.getAddress())
                .createdAt(user.getCreatedAt())
                .status(user.getStatus())
                .build();
    }
}
