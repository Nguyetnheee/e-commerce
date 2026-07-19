package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateSupplierRequest;
import com.example.fishingecommerce.backend.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {
    List<SupplierResponse> findAll();
    SupplierResponse create(CreateSupplierRequest request);
    void deleteByCode(String code);
}
