package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.service.PayOSPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments/payos")
@RequiredArgsConstructor
@Tag(name = "PayOS Payment", description = "Xử lý thanh toán PayOS")
public class PaymentController {

    private final PayOSPaymentService payOSPaymentService;

    @PostMapping("/webhook")
    @Operation(summary = "PayOS webhook", description = "PayOS gọi vào endpoint này để báo thanh toán thành công")
    public ResponseEntity<Map<String, Object>> webhook(@RequestBody Map<String, Object> body) {
        payOSPaymentService.verifyAndMarkPaid(body, payOSPaymentService::markOrderPaid);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/confirm-webhook")
    @Operation(summary = "Xác nhận webhook PayOS", description = "Đăng ký webhook public URL với PayOS")
    public ResponseEntity<Map<String, Object>> confirmWebhook() {
        String result = payOSPaymentService.confirmWebhook();
        return ResponseEntity.ok(Map.of("success", true, "result", result));
    }
}
