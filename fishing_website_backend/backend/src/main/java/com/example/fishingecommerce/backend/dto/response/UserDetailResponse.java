package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserDetailResponse {
    private Long id;
    private String fullname;
    private String email;
    private String phone;
    private String address;
    private String dob;
    private String gender;
    private String role;
    private UserAccountStatus status;
    private LocalDateTime createdAt;
    private Integer orderCount;
    private BigDecimal totalSpent;
    private List<UserOrderSummaryResponse> recentOrders;
}
