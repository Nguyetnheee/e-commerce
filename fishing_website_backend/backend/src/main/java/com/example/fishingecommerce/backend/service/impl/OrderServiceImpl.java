package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CancelOrderRequest;
import com.example.fishingecommerce.backend.dto.request.CreateOrderRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateOrderStatusRequest;
import com.example.fishingecommerce.backend.dto.response.OrderDetailResponse;
import com.example.fishingecommerce.backend.dto.response.OrderItemResponse;
import com.example.fishingecommerce.backend.dto.response.OrderResponse;
import com.example.fishingecommerce.backend.dto.response.OrderTrackingResponse;
import com.example.fishingecommerce.backend.dto.response.PaymentStatusResponse;
import com.example.fishingecommerce.backend.dto.response.ShippingEventResponse;
import com.example.fishingecommerce.backend.entity.Coupon;
import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.entity.OrderItem;
import com.example.fishingecommerce.backend.entity.ProductVariant;
import com.example.fishingecommerce.backend.entity.ShippingEvent;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.enums.PaymentStatus;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.CouponRepository;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.repository.ProductVariantRepository;
import com.example.fishingecommerce.backend.repository.ShippingEventRepository;
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
    private final ShippingEventRepository shippingEventRepository;

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

        // Coupons reduce product prices; shipping remains free.
        Coupon coupon = resolveCoupon(request.getCouponCode(), subtotal);
        java.math.BigDecimal discountAmount = calculateDiscountAmount(coupon, subtotal);
        order.setCouponCode(coupon != null ? coupon.getCode() : null);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(subtotal.subtract(discountAmount).max(java.math.BigDecimal.ZERO));
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

        if (order.getStatus() == OrderStatus.CANCELLED
                || order.getStatus() == OrderStatus.COMPLETED
                || order.getStatus() == OrderStatus.RETURNED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không thể thay đổi trạng thái đơn hàng đã kết thúc");
        }

        OrderStatus nextStatus = request.getStatus();
        if (nextStatus == OrderStatus.DELIVERED) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Shipper phải xác nhận ảnh giao hàng qua luồng giao hàng để hoàn tất đơn");
        }
        if (nextStatus == OrderStatus.SHIPPING) {
            if (order.getStatus() != OrderStatus.PACKING
                    && order.getStatus() != OrderStatus.DELIVERY_FAILED
                    && order.getStatus() != OrderStatus.DELIVERY_DISPUTED) {
                throw new AppException(HttpStatus.BAD_REQUEST, "SH-001: Chỉ đơn đã đóng gói hoặc được duyệt giao lại mới có thể vận chuyển");
            }
            if (order.getAssignedShipper() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Phải chỉ định shipper trước khi vận chuyển");
            }
            if (order.getRecipientName() == null || order.getRecipientName().isBlank()
                    || order.getRecipientPhone() == null || order.getRecipientPhone().isBlank()
                    || order.getShippingAddress() == null || order.getShippingAddress().isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "SH-004: Kho phải xác minh đầy đủ tên, số điện thoại và địa chỉ người nhận");
            }
            ensurePaymentEligibleForShipping(order);
            if (order.getTrackingNumber() == null) {
                order.setTrackingNumber("WSG-" + order.getId() + "-" + System.currentTimeMillis());
                order.setShippingLabelCreatedAt(java.time.LocalDateTime.now());
            }
            order.setDeliveryAttemptCount((order.getDeliveryAttemptCount() == null ? 0 : order.getDeliveryAttemptCount()) + 1);
            order.setDeliveryFailureReason(null);
            order.setDeliveryFailedAt(null);
        } else if (nextStatus == OrderStatus.RETURNED
                && order.getStatus() != OrderStatus.DELIVERY_FAILED
                && order.getStatus() != OrderStatus.DELIVERY_DISPUTED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ đơn giao không thành công mới có thể trả lại kho");
        }

        order.setStatus(nextStatus);
        Order saved = orderRepository.save(order);
        recordShippingEvent(saved, nextStatus,
                nextStatus == OrderStatus.SHIPPING ? "Đơn hàng được bàn giao để vận chuyển" :
                nextStatus == OrderStatus.RETURNED ? "Gói hàng được chuyển trả về kho để kiểm tra" :
                "Cập nhật trạng thái đơn hàng", "ADMIN/KHO");
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

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.COMPLETED) {
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
        recordShippingEvent(saved, OrderStatus.CANCELLED, request.getReason(), "ADMIN");
        return mapToResponse(saved);
    }

    @Override
    public List<OrderResponse> getMyOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

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
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus() != null ? order.getStatus().name() : OrderStatus.PENDING.name())
                    .paymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : PaymentStatus.PENDING.name())
                    .paymentMethod(order.getPaymentMethod())
                    .totalAmount(order.getTotalAmount())
                    .discountAmount(order.getDiscountAmount())
                    .couponCode(order.getCouponCode())
                    .recipientName(order.getRecipientName())
                    .recipientPhone(order.getRecipientPhone())
                    .shippingAddress(order.getShippingAddress())
                    .cancelReason(order.getCancelReason())
                    .deliveredAt(order.getDeliveredAt())
                    .customerConfirmedAt(order.getCustomerConfirmedAt())
                    .customerDeliveryReport(order.getCustomerDeliveryReport())
                    .customerReportedAt(order.getCustomerReportedAt())
                    .createdAt(order.getCreatedAt())
                    .updatedAt(order.getUpdatedAt())
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

    @Override
    @Transactional
    public OrderDetailResponse approveAndAssignShipper(Long orderId, Long shipperId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể phê duyệt đơn hàng đang chờ xử lý");
        }
        ensurePaymentEligibleForShipping(order);

        com.example.fishingecommerce.backend.entity.User shipper = userRepository.findById(shipperId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản shipper"));
        boolean isShipper = shipper.getRole() == com.example.fishingecommerce.backend.enums.UserRole.SHIPPER
                || (shipper.getRoles() != null && shipper.getRoles().stream().anyMatch(role -> "SHIPPER".equals(role.getName())));
        if (!isShipper || shipper.getStatus() != com.example.fishingecommerce.backend.enums.UserAccountStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tài khoản được chọn không phải shipper đang hoạt động");
        }

        order.setAssignedShipper(shipper);
        order.setStatus(OrderStatus.PACKING);
        Order saved = orderRepository.saveAndFlush(order);
        recordShippingEvent(saved, OrderStatus.PACKING,
                "Đơn được phê duyệt, gán cho " + shipper.getEmail() + " và chờ kho đóng gói", "ADMIN");
        return mapToResponse(saved);
    }

    @Override
    public List<OrderDetailResponse> getAssignedDeliveries(Long shipperId) {
        return orderRepository.findByAssignedShipperIdOrderByUpdatedAtDesc(shipperId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderDetailResponse completeDelivery(
            Long orderId,
            Long shipperId,
            String proofImageUrl,
            String codPaymentProofImageUrl) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));
        if (order.getAssignedShipper() == null || !order.getAssignedShipper().getId().equals(shipperId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Đơn hàng này không được giao cho bạn");
        }
        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa ở trạng thái đang giao");
        }
        if (proofImageUrl == null || proofImageUrl.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bắt buộc có ảnh xác nhận giao hàng");
        }

        boolean codOrder = "COD".equalsIgnoreCase(order.getPaymentMethod());
        if (codOrder && (codPaymentProofImageUrl == null || codPaymentProofImageUrl.isBlank())) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Đơn COD bắt buộc có ảnh chứng minh shipper đã nhận tiền");
        }

        order.setDeliveryProofImage(proofImageUrl.trim());
        order.setCodPaymentProofImage(codOrder ? codPaymentProofImageUrl.trim() : null);
        order.setDeliveredAt(java.time.LocalDateTime.now());
        order.setStatus(OrderStatus.DELIVERED);
        if (codOrder) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        Order saved = orderRepository.saveAndFlush(order);
        recordShippingEvent(saved, OrderStatus.DELIVERED,
                codOrder
                        ? "Shipper đã giao hàng, có ảnh giao hàng và ảnh thu tiền COD; chờ khách hàng xác nhận"
                        : "Shipper đã giao hàng và có ảnh xác nhận; chờ khách hàng xác nhận",
                "SHIPPER");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse confirmReceived(Long orderId, Long userId) {
        Order order = loadOwnedOrder(orderId, userId);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể xác nhận đơn đang chờ khách hàng nhận hàng");
        }
        order.setStatus(OrderStatus.COMPLETED);
        order.setCustomerConfirmedAt(java.time.LocalDateTime.now());
        order.setCustomerDeliveryReport(null);
        order.setCustomerReportedAt(null);
        Order saved = orderRepository.saveAndFlush(order);
        recordShippingEvent(saved, OrderStatus.COMPLETED,
                "Khách hàng xác nhận đã nhận đủ hàng; đơn hàng hoàn thành cho hai bên", "CUSTOMER");
        return mapToCustomerOrderResponse(saved);
    }

    @Override
    @Transactional
    public OrderResponse reportNotReceived(Long orderId, Long userId, String reason) {
        Order order = loadOwnedOrder(orderId, userId);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể báo chưa nhận đối với đơn shipper đã đánh dấu đã giao");
        }
        order.setStatus(OrderStatus.DELIVERY_DISPUTED);
        order.setCustomerDeliveryReport(reason.trim());
        order.setCustomerReportedAt(java.time.LocalDateTime.now());
        Order saved = orderRepository.saveAndFlush(order);
        recordShippingEvent(saved, OrderStatus.DELIVERY_DISPUTED,
                "Khách hàng báo chưa nhận được hàng: " + reason.trim(), "CUSTOMER");
        return mapToCustomerOrderResponse(saved);
    }

    @Override
    @Transactional
    public OrderDetailResponse failDelivery(Long orderId, Long shipperId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));
        if (order.getAssignedShipper() == null || !order.getAssignedShipper().getId().equals(shipperId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Đơn hàng này không được giao cho bạn");
        }
        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ có thể báo thất bại đối với đơn đang giao");
        }
        if (reason == null || reason.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bắt buộc chọn lý do giao hàng không thành công");
        }
        order.setStatus(OrderStatus.DELIVERY_FAILED);
        order.setDeliveryFailureReason(reason.trim());
        order.setDeliveryFailedAt(java.time.LocalDateTime.now());
        Order saved = orderRepository.saveAndFlush(order);
        recordShippingEvent(saved, OrderStatus.DELIVERY_FAILED, reason.trim(), "SHIPPER");
        return mapToResponse(saved);
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
                .assignedShipperId(order.getAssignedShipper() != null ? order.getAssignedShipper().getId() : null)
                .assignedShipperName(order.getAssignedShipper() != null ? order.getAssignedShipper().getFullname() : null)
                .assignedShipperEmail(order.getAssignedShipper() != null ? order.getAssignedShipper().getEmail() : null)
                .deliveryProofImage(order.getDeliveryProofImage())
                .codPaymentProofImage(order.getCodPaymentProofImage())
                .deliveredAt(order.getDeliveredAt())
                .customerConfirmedAt(order.getCustomerConfirmedAt())
                .customerDeliveryReport(order.getCustomerDeliveryReport())
                .customerReportedAt(order.getCustomerReportedAt())
                .deliveryFailureReason(order.getDeliveryFailureReason())
                .deliveryFailedAt(order.getDeliveryFailedAt())
                .deliveryAttemptCount(order.getDeliveryAttemptCount())
                .trackingNumber(order.getTrackingNumber())
                .shippingLabelCreatedAt(order.getShippingLabelCreatedAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getOrderItems() != null
                        ? order.getOrderItems().stream().map(this::mapItemToResponse).collect(Collectors.toList())
                        : List.of())
                .shippingHistory(shippingEventRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())
                        .stream()
                        .map(event -> ShippingEventResponse.builder()
                                .id(event.getId())
                                .status(event.getStatus())
                                .note(event.getNote())
                                .actor(event.getActor())
                                .createdAt(event.getCreatedAt())
                                .build())
                        .toList())
                .build();
    }

    private Order loadOwnedOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xử lý đơn hàng này");
        }
        return order;
    }

    private OrderResponse mapToCustomerOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .couponCode(order.getCouponCode())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .shippingAddress(order.getShippingAddress())
                .cancelReason(order.getCancelReason())
                .deliveredAt(order.getDeliveredAt())
                .customerConfirmedAt(order.getCustomerConfirmedAt())
                .customerDeliveryReport(order.getCustomerDeliveryReport())
                .customerReportedAt(order.getCustomerReportedAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getOrderItems() == null ? List.of() :
                        order.getOrderItems().stream().map(this::mapItemToResponse).toList())
                .build();
    }

    private void recordShippingEvent(Order order, OrderStatus status, String note, String actor) {
        shippingEventRepository.save(ShippingEvent.builder()
                .order(order)
                .status(status)
                .note(note)
                .actor(actor)
                .build());
    }

    private void ensurePaymentEligibleForShipping(Order order) {
        boolean codConfirmed = "COD".equalsIgnoreCase(order.getPaymentMethod());
        boolean onlinePaid = order.getPaymentStatus() == PaymentStatus.PAID;
        if (!codConfirmed && !onlinePaid) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Đơn thanh toán trực tuyến phải hoàn tất thanh toán trước khi đóng gói hoặc vận chuyển");
        }
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
