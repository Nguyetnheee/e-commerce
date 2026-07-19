package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateBrandRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateBrandRequest;
import com.example.fishingecommerce.backend.dto.response.BrandDetailResponse;
import com.example.fishingecommerce.backend.dto.response.BrandResponse;
import com.example.fishingecommerce.backend.entity.Brand;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.BrandRepository;
import com.example.fishingecommerce.backend.repository.ProductRepository;
import com.example.fishingecommerce.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Override
    public List<BrandResponse> findAll() {
        return brandRepository.findAllByOrderByNameAsc().stream()
                .map(brand -> BrandResponse.builder()
                        .id(brand.getId())
                        .name(brand.getName())
                        .country(brand.getCountry())
                        .build())
                .toList();
    }

    @Override
    public List<BrandResponse> findAvailableBrands(Long categoryId, com.example.fishingecommerce.backend.enums.Locations location) {
        return brandRepository.findAvailableBrands(categoryId, location).stream()
                .map(brand -> BrandResponse.builder()
                        .id(brand.getId())
                        .name(brand.getName())
                        .country(brand.getCountry())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDetailResponse findById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thuong hieu khong ton tai"));
        return BrandDetailResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .country(brand.getCountry())
                .productCount(productRepository.countByBrand_Id(id))
                .build();
    }

    @Override
    @Transactional
    public BrandResponse create(CreateBrandRequest request) {
        String name = normalizeName(request.getName());
        if (brandRepository.existsByNameIgnoreCase(name)) {
            throw new AppException(HttpStatus.CONFLICT, "Thuong hieu da ton tai");
        }

        Brand brand = Brand.builder()
                .name(name)
                .country(request.getCountry())
                .build();

        return mapToResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(Long id, UpdateBrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thuong hieu khong ton tai"));

        String name = normalizeName(request.getName());
        boolean duplicate = brandRepository.findAll().stream()
                .anyMatch(existing -> existing.getId() != null
                        && !existing.getId().equals(id)
                        && existing.getName() != null
                        && existing.getName().equalsIgnoreCase(name));
        if (duplicate) {
            throw new AppException(HttpStatus.CONFLICT, "Thuong hieu da ton tai");
        }

        brand.setName(name);
        brand.setCountry(request.getCountry());
        return mapToResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thuong hieu khong ton tai"));
        if (productRepository.existsByBrand_Id(id)) {
            throw new AppException(HttpStatus.CONFLICT, "Thuong hieu dang duoc gan voi san pham");
        }
        brandRepository.delete(brand);
    }

    private BrandResponse mapToResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .country(brand.getCountry())
                .build();
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ten thuong hieu khong duoc de trong");
        }
        return name.trim();
    }
}
