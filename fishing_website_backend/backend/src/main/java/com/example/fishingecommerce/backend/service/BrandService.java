package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateBrandRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateBrandRequest;
import com.example.fishingecommerce.backend.dto.response.BrandDetailResponse;
import com.example.fishingecommerce.backend.dto.response.BrandResponse;
import com.example.fishingecommerce.backend.enums.Locations;

import java.util.List;

public interface BrandService {
    List<BrandResponse> findAll();
    List<BrandResponse> findAvailableBrands(Long categoryId, Locations location);
    BrandDetailResponse findById(Long id);
    BrandResponse create(CreateBrandRequest request);
    BrandResponse update(Long id, UpdateBrandRequest request);
    void delete(Long id);
}
