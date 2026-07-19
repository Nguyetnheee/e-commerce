package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateOrderRequest;
import com.example.fishingecommerce.backend.dto.request.DeliveryReportRequest;
import com.example.fishingecommerce.backend.dto.request.ShippingFeeRequest;
import com.example.fishingecommerce.backend.dto.response.OrderDetailResponse;
import com.example.fishingecommerce.backend.dto.response.OrderResponse;
import com.example.fishingecommerce.backend.dto.response.OrderTrackingResponse;
import com.example.fishingecommerce.backend.dto.response.PaymentStatusResponse;
import com.example.fishingecommerce.backend.dto.response.ShippingFeeResponse;
import com.example.fishingecommerce.backend.service.OrderService;
import com.example.fishingecommerce.backend.service.ShippingFeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Order", description = "Quản lý đơn hàng của khách hàng")
public class OrderController {

    private final OrderService orderService;
    private final ShippingFeeService shippingFeeService;

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới (Checkout)", description = "Đặt hàng, sinh mã đơn, trừ kho tạm và xóa khỏi giỏ hàng")
    public ResponseEntity<OrderDetailResponse> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(orderService.createOrder(userId, request));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy đơn hàng của tôi", description = "Lấy danh sách đơn hàng cá nhân của khách hàng đang đăng nhập")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        List<OrderResponse> orders = orderService.getMyOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/{id}/confirm-received")
    @Operation(summary = "Khách hàng xác nhận đã nhận hàng")
    public ResponseEntity<OrderResponse> confirmReceived(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.confirmReceived(id, Long.valueOf(authentication.getName())));
    }

    @PostMapping("/{id}/report-not-received")
    @Operation(summary = "Khách hàng báo chưa nhận được hàng")
    public ResponseEntity<OrderResponse> reportNotReceived(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryReportRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.reportNotReceived(
                id, Long.valueOf(authentication.getName()), request.getReason()));
    }

    @GetMapping("/tracking/{orderCode}")
    @Operation(summary = "Theo dõi đơn hàng", description = "Theo dõi trạng thái đơn hàng theo mã đơn hàng")
    public ResponseEntity<OrderTrackingResponse> trackOrder(
            @PathVariable String orderCode,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        OrderTrackingResponse tracking = orderService.getOrderTracking(orderCode, userId);
        return ResponseEntity.ok(tracking);
    }

    @GetMapping("/tracking/{orderCode}/payment-status")
    @Operation(summary = "Kiểm tra trạng thái thanh toán", description = "Trả về trạng thái thanh toán của đơn hàng")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(
            @PathVariable String orderCode,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(orderService.getPaymentStatus(orderCode, userId));
    }

    @PostMapping("/{orderCode}/recreate-payment-link")
    @Operation(summary = "Tạo lại link thanh toán", description = "Tạo lại checkout URL mới cho đơn hàng PayOS")
    public ResponseEntity<Map<String, Object>> recreatePaymentLink(
            @PathVariable String orderCode,
            Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        String checkoutUrl = orderService.recreatePaymentLink(orderCode, userId);
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    @PostMapping("/shipping-fee")
    @Operation(summary = "Tính phí vận chuyển", description = "Tính phí vận chuyển theo khu vực và số lượng sản phẩm")
    public ResponseEntity<ShippingFeeResponse> calculateShippingFee(@Valid @RequestBody ShippingFeeRequest request) {
        return ResponseEntity.ok(shippingFeeService.calculateShippingFee(request));
    }
}
