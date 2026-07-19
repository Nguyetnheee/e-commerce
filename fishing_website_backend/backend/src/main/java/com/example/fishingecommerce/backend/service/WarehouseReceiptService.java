package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateWarehouseReceiptRequest;
import com.example.fishingecommerce.backend.dto.response.WarehouseReceiptResponse;
import com.example.fishingecommerce.backend.dto.response.WarehouseReceiptSummaryResponse;

import java.util.List;

public interface WarehouseReceiptService {
    WarehouseReceiptResponse create(CreateWarehouseReceiptRequest request, String createdBy);
    List<WarehouseReceiptSummaryResponse> findAll();
    WarehouseReceiptResponse findByCode(String code);
}
