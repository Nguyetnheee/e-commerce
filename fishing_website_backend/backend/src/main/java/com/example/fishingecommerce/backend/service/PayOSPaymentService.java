package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.enums.PaymentStatus;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

import java.util.Map;
import java.util.function.LongConsumer;

@Service
public class PayOSPaymentService {

    private final OrderRepository orderRepository;

    @Value("${payos.return-url:https://orange-water-0dc520900.7.azurestaticapps.net/payment/success}")
    private String returnUrl;

    @Value("${payos.cancel-url:https://orange-water-0dc520900.7.azurestaticapps.net/payment/failure}")
    private String cancelUrl;

    @Value("${payos.webhook-url:}")
    private String webhookUrl;

    public PayOSPaymentService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public String createCheckoutUrl(Order order) {
        PayOS client = createClient();

        if (order.getOrderCode() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thiếu orderCode để tạo PayOS checkout");
        }
        if (order.getTotalAmount() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thiếu totalAmount để tạo PayOS checkout");
        }

        long orderCode = Long.parseLong(order.getOrderCode());
        long amount = order.getTotalAmount().longValueExact();

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .amount(amount)
                .description(buildDescription(order))
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .build();

        try {
            CreatePaymentLinkResponse response = client.paymentRequests().create(paymentData);
            return response.getCheckoutUrl();
        } catch (Exception e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không tạo được PayOS checkout: " + e.getMessage());
        }
    }

    public void verifyAndMarkPaid(Map<String, Object> body, LongConsumer onOrderPaid) {
        PayOS client = createClient();

        try {
            var webhookData = client.webhooks().verify(body);
            onOrderPaid.accept(webhookData.getOrderCode());
        } catch (Exception e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Webhook PayOS không hợp lệ: " + e.getMessage());
        }
    }

    public void markOrderPaid(long orderCode) {
        // PayOS sends a signed sample payload while confirming the webhook URL.
        // Acknowledge verified payloads whose sample order does not exist locally.
        Order order = orderRepository.findByOrderCode(String.valueOf(orderCode)).orElse(null);
        if (order == null) {
            return;
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepository.save(order);
    }

    public String confirmWebhook() {
        if (webhookUrl == null || webhookUrl.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thiếu cấu hình payos.webhook-url");
        }

        PayOS client = createClient();
        try {
            return client.webhooks().confirm(webhookUrl).toString();
        } catch (Exception e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không xác nhận được webhook PayOS: " + e.getMessage());
        }
    }

    public boolean isConfigured() {
        String clientId = System.getenv("PAYOS_CLIENT_ID");
        String apiKey = System.getenv("PAYOS_API_KEY");
        String checksumKey = System.getenv("PAYOS_CHECKSUM_KEY");
        return clientId != null && !clientId.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && checksumKey != null && !checksumKey.isBlank();
    }

    private PayOS createClient() {
        if (!isConfigured()) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "PayOS chưa được cấu hình. Hãy set PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY.");
        }
        return PayOS.fromEnv();
    }

    private String buildDescription(Order order) {
        String code = order.getOrderCode() != null ? order.getOrderCode() : String.valueOf(order.getId());
        String description = "Order " + code;
        return description.length() > 25 ? description.substring(0, 25) : description;
    }
}
