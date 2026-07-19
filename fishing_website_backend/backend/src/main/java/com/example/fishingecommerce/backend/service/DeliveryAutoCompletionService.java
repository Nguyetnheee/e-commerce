package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.entity.ShippingEvent;
import com.example.fishingecommerce.backend.entity.UserNotification;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.repository.ShippingEventRepository;
import com.example.fishingecommerce.backend.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryAutoCompletionService {
    private static final long AUTO_CONFIRM_HOURS = 2;

    private final OrderRepository orderRepository;
    private final ShippingEventRepository shippingEventRepository;
    private final UserNotificationRepository notificationRepository;

    @Scheduled(fixedDelayString = "${app.orders.auto-confirm-check-ms:60000}")
    @Transactional
    public void autoCompleteDeliveredOrders() {
        LocalDateTime deadline = LocalDateTime.now().minusHours(AUTO_CONFIRM_HOURS);
        List<Order> expiredOrders =
                orderRepository.findByStatusAndDeliveredAtLessThanEqual(OrderStatus.DELIVERED, deadline);

        for (Order order : expiredOrders) {
            if (order.getStatus() != OrderStatus.DELIVERED) {
                continue;
            }
            order.setStatus(OrderStatus.COMPLETED);
            order.setCustomerConfirmedAt(LocalDateTime.now());
            Order saved = orderRepository.save(order);

            shippingEventRepository.save(ShippingEvent.builder()
                    .order(saved)
                    .status(OrderStatus.COMPLETED)
                    .actor("SYSTEM")
                    .note("Hệ thống tự động xác nhận khách đã nhận hàng sau 2 giờ không có phản hồi")
                    .build());

            notificationRepository.save(UserNotification.builder()
                    .user(saved.getUser())
                    .type("success")
                    .message("Đơn " + saved.getOrderCode()
                            + " đã được hệ thống tự động xác nhận hoàn thành sau 2 giờ không có phản hồi. "
                            + "Bạn có thể đánh giá sản phẩm trong đơn.")
                    .build());
        }
    }
}
