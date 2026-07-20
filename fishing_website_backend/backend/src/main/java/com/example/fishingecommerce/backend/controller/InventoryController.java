package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.response.InventoryLogResponse;
import com.example.fishingecommerce.backend.dto.response.InventoryDashboardResponse;
import com.example.fishingecommerce.backend.dto.response.VariantResponse;
import com.example.fishingecommerce.backend.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Quản lý và giám sát kho hàng (Inventory)")
@SecurityRequirement(name = "Bearer Authentication")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/alerts/out-of-stock")
    @Operation(summary = "Lấy cảnh báo hết hàng", description = "Lấy danh sách các biến thể sản phẩm sắp hết hàng hoặc đã hết hàng")
    public ResponseEntity<List<VariantResponse>> getOutOfStockAlerts() {
        return ResponseEntity.ok(inventoryService.findOutOfStockAlerts());
    }

    @GetMapping("/items")
    @Operation(summary = "Lấy toàn bộ sản phẩm kho", description = "Lấy danh sách tất cả các sản phẩm và biến thể đang có trong cơ sở dữ liệu")
    public ResponseEntity<List<VariantResponse>> getAllInventoryItems() {
        return ResponseEntity.ok(inventoryService.findAllItems());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Số liệu dashboard kho", description = "Tổng hợp trực tiếp tồn kho, cảnh báo, đơn đóng gói và phiếu nhập trong DB")
    public ResponseEntity<InventoryDashboardResponse> getDashboardSummary() {
        return ResponseEntity.ok(inventoryService.getDashboardSummary());
    }

    @GetMapping("/logs")
    @Operation(summary = "Lấy nhật ký kho hàng", description = "Lấy danh sách nhật ký thay đổi kho hàng, hỗ trợ lọc theo biến thể sản phẩm và khoảng thời gian")
    public ResponseEntity<List<InventoryLogResponse>> getInventoryLogs(
            @RequestParam(required = false) Long variantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) {
        return ResponseEntity.ok(inventoryService.findLogs(variantId, fromDate, toDate));
    }
}
