package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateWarehouseInspectionRequest;
import com.example.fishingecommerce.backend.dto.response.WarehouseInspectionResponse;

public interface WarehouseInspectionService {
    WarehouseInspectionResponse create(CreateWarehouseInspectionRequest request);
}
