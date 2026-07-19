package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.response.RevenueReportResponse;
import com.example.fishingecommerce.backend.dto.response.TopSellingResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    RevenueReportResponse getRevenueReport(LocalDate fromDate, LocalDate toDate);
    List<TopSellingResponse> getTopSelling(LocalDate fromDate, LocalDate toDate);
}
