package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CancelOrderRequest;
import com.example.fishingecommerce.backend.dto.response.OrderDetailResponse;
import com.example.fishingecommerce.backend.dto.response.OrderResponse;
import com.example.fishingecommerce.backend.dto.response.OrderTrackingResponse;
import com.example.fishingecommerce.backend.dto.response.PaymentStatusResponse;
import com.example.fishingecommerce.backend.dto.request.UpdateOrderStatusRequest;
import com.example.fishingecommerce.backend.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderDetailResponse> findOrders(OrderStatus status);
    OrderDetailResponse findById(Long id);
    OrderDetailResponse createOrder(Long userId, com.example.fishingecommerce.backend.dto.request.CreateOrderRequest request);
    OrderDetailResponse updateStatus(Long id, UpdateOrderStatusRequest request);
    OrderDetailResponse cancelOrder(Long id, CancelOrderRequest request);
    List<OrderResponse> getMyOrders(Long userId);
    OrderTrackingResponse getOrderTracking(String orderCode, Long userId);
    PaymentStatusResponse getPaymentStatus(String orderCode, Long userId);
    String recreatePaymentLink(String orderCode, Long userId);
    OrderDetailResponse approveAndAssignShipper(Long orderId, Long shipperId);
    List<OrderDetailResponse> getAssignedDeliveries(Long shipperId);
    OrderDetailResponse completeDelivery(Long orderId, Long shipperId, String proofImageUrl);
}
