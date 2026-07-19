package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CancelOrderRequest;
import com.example.fishingecommerce.backend.dto.request.CreateOrderRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateOrderStatusRequest;
import com.example.fishingecommerce.backend.dto.response.OrderDetailResponse;
import com.example.fishingecommerce.backend.dto.response.OrderItemResponse;
import com.example.fishingecommerce.backend.dto.response.OrderResponse;
import com.example.fishingecommerce.backend.dto.response.OrderTrackingResponse;
import com.example.fishingecommerce.backend.dto.response.PaymentStatusResponse;
import com.example.fishingecommerce.backend.entity.Coupon;
import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.entity.OrderItem;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.enums.PaymentStatus;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.CouponRepository;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import com.example.fishingecommerce.backend.service.OrderService;
import com.example.fishingecommerce.backend.service.PayOSPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final com.example.fishingecommerce.backend.repository.UserRepository userRepository;
    private final com.example.fishingecommerce.backend.repository.CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final PayOSPaymentService payOSPaymentService;

    @Override
    @Transactional
    public OrderDetailResponse createOrder(Long userId, CreateOrderRequest request) {
        com.example.fishingecommerce.backend.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        java.math.BigDecimal subtotal = java.math.BigDecimal.ZERO;
        java.util.List<OrderItem> orderItems = new java.util.ArrayList<>();
        Order order = Order.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        for (com.example.fishingecommerce.backend.dto.request.CartItemRequest itemReq : request.getItems()) {
            ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));

            if (variant.getStockQuantity() < itemReq.getQuantity()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng trong kho không đủ cho sản phẩm: " + variant.getVariantName());
            }

            variant.setStockQuantity(variant.getStockQuantity() - itemReq.getQuantity());
            variantRepository.save(variant);

            java.math.BigDecimal price = variant.getDiscountPrice() != null ? variant.getDiscountPrice() : variant.getBasePrice();
            subtotal = subtotal.add(price.multiply(java.math.BigDecimal.valueOf(itemReq.getQuantity())));

            OrderItem orderItem = OrderItem.builder()
                    .order(null)
                    .product(variant.getProduct())
                    .variant(variant)
                    .quantity(itemReq.getQuantity())
                    .soldPrice(price)
                    .build();
            orderItem.setOrder(order);
            orderItems.add(orderItem);

            cartItemRepository.findByUserIdAndVariantId(userId, variant.getId())
                    .ifPresent(cartItemRepository::delete);
        }

        Coupon coupon = resolveCoupon(request.getCouponCode(), subtotal);
        java.math.BigDecimal discountAmount = calculateDiscountAmount(coupon, subtotal);
        java.math.BigDecimal totalAmount = subtotal.subtract(discountAmount);
        if (totalAmount.compareTo(java.math.BigDecimal.ZERO) < 0) {
            totalAmount = java.math.BigDecimal.ZERO;
        }

        order.setCouponCode(coupon != null ? coupon.getCode() : null);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        Order persisted = orderRepository.save(order);
        persisted.setOrderCode(String.valueOf(persisted.getId()));
        persisted.setOrderItems(orderItems);

        Order saved = orderRepository.save(persisted);

        if (request.getPaymentMethod() != null && request.getPaymentMethod().equalsIgnoreCase("PAYOS")) {
            String checkoutUrl = payOSPaymentService.createCheckoutUrl(saved);
            saved.setPaymentLinkUrl(checkoutUrl);
            saved = orderRepository.save(saved);
        }
        return mapToResponse(saved);
    }

    @Override
    public List<OrderDetailResponse> findOrders(OrderStatus status) {
        List<Order> orders = status != null ? orderRepository.findByStatus(status) : orderRepository.findAll();
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public OrderDetailResponse findById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public OrderDetailResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không thể thay đổi trạng thái đơn hàng đã hủy hoặc đã giao");
        }

        order.setStatus(request.getStatus());
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public OrderDetailResponse cancelOrder(Long id, CancelOrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng đã được hủy trước đó");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không thể hủy đơn hàng đã giao");
        }

        for (OrderItem item : order.getOrderItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null) {
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                variantRepository.save(variant);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(request.getReason());
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Override
    public List<OrderResponse> getMyOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        return orders.stream().map(order -> {
            List<OrderItemResponse> itemResponses;
            if (order.getOrderItems() != null) {
                itemResponses = order.getOrderItems().stream()
                        .map(this::mapItemToResponse)
                        .collect(Collectors.toList());
            } else {
                itemResponses = List.of();
            }

            return OrderResponse.builder()
                    .id(order.getId())
                    .items(itemResponses)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public OrderTrackingResponse getOrderTracking(String orderCode, Long userId) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new com.example.fishingecommerce.backend.exceptions.ResourceNotFoundException("Order not found with code: " + orderCode));

        // Security check: Only the owner can track their order
        if (!order.getUser().getId().equals(userId)) {
            throw new com.example.fishingecommerce.backend.exceptions.AppException(org.springframework.http.HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn hàng này");
        }

        List<OrderItemResponse> itemResponses;
        if (order.getOrderItems() != null) {
            itemResponses = order.getOrderItems().stream()
                    .map(this::mapItemToResponse)
                    .collect(Collectors.toList());
        } else {
            itemResponses = List.of();
        }

        return OrderTrackingResponse.builder()
                .orderCode(order.getOrderCode())
                .status(order.getStatus() != null ? order.getStatus().name() : OrderStatus.PENDING.name())
                .items(itemResponses)
                .build();
    }

    @Override
    public PaymentStatusResponse getPaymentStatus(String orderCode, Long userId) {
        Order order = loadOwnedOrder(orderCode, userId);
        return PaymentStatusResponse.builder()
                .orderCode(order.getOrderCode())
                .paymentStatus(order.getPaymentStatus())
                .build();
    }

    @Override
    @Transactional
    public String recreatePaymentLink(String orderCode, Long userId) {
        Order order = loadOwnedOrder(orderCode, userId);

        if (!"PAYOS".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng này không thanh toán bằng PayOS");
        }
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng đã thanh toán rồi");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng đã bị hủy");
        }

        String checkoutUrl = payOSPaymentService.createCheckoutUrl(order);
        order.setPaymentLinkUrl(checkoutUrl);
        orderRepository.save(order);
        return checkoutUrl;
    }

    private OrderDetailResponse mapToResponse(Order order) {
        return OrderDetailResponse.builder()
                .id(order.getId())
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .couponCode(order.getCouponCode())
                .paymentStatus(order.getPaymentStatus())
                .checkoutUrl(order.getPaymentLinkUrl())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .cancelReason(order.getCancelReason())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getOrderItems() != null
                        ? order.getOrderItems().stream().map(this::mapItemToResponse).collect(Collectors.toList())
                        : List.of())
                .build();
    }

    private Order loadOwnedOrder(String orderCode, Long userId) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new com.example.fishingecommerce.backend.exceptions.ResourceNotFoundException("Order not found with code: " + orderCode));
        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn hàng này");
        }
        return order;
    }

    private Coupon resolveCoupon(String couponCode, java.math.BigDecimal subtotal) {
        if (couponCode == null || couponCode.isBlank()) {
            return null;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Mã giảm giá không hợp lệ"));

        if (Boolean.FALSE.equals(coupon.getActive())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã bị vô hiệu hóa");
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn");
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá");
        }

        return coupon;
    }

    private java.math.BigDecimal calculateDiscountAmount(Coupon coupon, java.math.BigDecimal subtotal) {
        if (coupon == null || coupon.getDiscountValue() == null) {
            return java.math.BigDecimal.ZERO;
        }

        java.math.BigDecimal discount;
        String discountType = coupon.getDiscountType() != null ? coupon.getDiscountType().toUpperCase(Locale.ROOT) : "PERCENT";
        if ("AMOUNT".equals(discountType)) {
            discount = coupon.getDiscountValue();
        } else {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(java.math.BigDecimal.valueOf(100), java.math.MathContext.DECIMAL64);
        }

        if (discount.compareTo(subtotal) > 0) {
            return subtotal;
        }
        return discount.max(java.math.BigDecimal.ZERO);
    }

    private OrderItemResponse mapItemToResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productImage(item.getProduct() != null ? item.getProduct().getImage() : null)
                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .variantName(item.getVariant() != null ? item.getVariant().getVariantName() : null)
                .quantity(item.getQuantity())
                .soldPrice(item.getSoldPrice())
                .build();
    }
}
