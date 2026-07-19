package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CompleteDeliveryRequest;
import com.example.fishingecommerce.backend.dto.request.FailDeliveryRequest;
import com.example.fishingecommerce.backend.dto.response.OrderDetailResponse;
import com.example.fishingecommerce.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shipper/orders")
@RequiredArgsConstructor
public class ShipperOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderDetailResponse>> getAssignedOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getAssignedDeliveries(Long.valueOf(authentication.getName())));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<OrderDetailResponse> completeDelivery(
            @PathVariable Long id,
            @Valid @RequestBody CompleteDeliveryRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.completeDelivery(
                id,
                Long.valueOf(authentication.getName()),
                request.getProofImageUrl()));
    }

    @PostMapping("/{id}/fail")
    public ResponseEntity<OrderDetailResponse> failDelivery(
            @PathVariable Long id,
            @Valid @RequestBody FailDeliveryRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(orderService.failDelivery(
                id,
                Long.valueOf(authentication.getName()),
                request.getReason()));
    }
}
