package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CancelOrderRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateOrderStatusRequest;
import com.example.fishingecommerce.backend.dto.request.AssignShipperRequest;
import com.example.fishingecommerce.backend.dto.response.OrderDetailResponse;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Order", description = "Quản lý đơn hàng của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Lấy danh sách đơn hàng", description = "Lọc đơn hàng theo trạng thái và lấy thông tin chi tiết của tất cả đơn hàng")
    public ResponseEntity<List<OrderDetailResponse>> getOrders(
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.findOrders(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết đơn hàng", description = "Lấy thông tin chi tiết đơn hàng theo ID")
    public ResponseEntity<OrderDetailResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng", description = "Cập nhật trạng thái của đơn hàng (chỉ cho phép khi chưa giao hoặc hủy)")
    public ResponseEntity<OrderDetailResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy đơn hàng", description = "Hủy đơn hàng và hoàn lại số lượng tồn kho sản phẩm")
    public ResponseEntity<OrderDetailResponse> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request) {
        return ResponseEntity.ok(orderService.cancelOrder(id, request));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Phê duyệt và gán shipper", description = "Phê duyệt đơn hàng, gán shipper và chuyển sang trạng thái đóng gói")
    public ResponseEntity<OrderDetailResponse> approveAndAssignShipper(
            @PathVariable Long id,
            @Valid @RequestBody AssignShipperRequest request) {
        return ResponseEntity.ok(orderService.approveAndAssignShipper(id, request.getShipperId()));
    }
}
