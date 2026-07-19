package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.response.RevenueReportResponse;
import com.example.fishingecommerce.backend.dto.response.TopSellingResponse;
import com.example.fishingecommerce.backend.service.ReportService;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin Report", description = "Xem các báo cáo doanh thu và bán hàng của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    @Operation(summary = "Lấy báo cáo doanh thu", description = "Tính toán doanh thu thực tế từ các đơn hàng hoàn thành (DELIVERED) trong khoảng thời gian")
    public ResponseEntity<RevenueReportResponse> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(reportService.getRevenueReport(fromDate, toDate));
    }

    @GetMapping("/top-selling")
    @Operation(summary = "Lấy danh sách sản phẩm bán chạy", description = "Thống kê danh sách sản phẩm bán chạy nhất trong khoảng thời gian")
    public ResponseEntity<List<TopSellingResponse>> getTopSelling(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(reportService.getTopSelling(fromDate, toDate));
    }
}
