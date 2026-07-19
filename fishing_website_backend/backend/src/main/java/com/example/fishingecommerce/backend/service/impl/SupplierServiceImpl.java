package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateSupplierRequest;
import com.example.fishingecommerce.backend.dto.response.SupplierResponse;
import com.example.fishingecommerce.backend.entity.Supplier;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.SupplierRepository;
import com.example.fishingecommerce.backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public List<SupplierResponse> findAll() {
        return supplierRepository.findAll().stream()
                .sorted(Comparator.comparing(Supplier::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public SupplierResponse create(CreateSupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .code(generateCode())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .productsProvided(request.getProductsProvided())
                .build();

        return mapToResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public void deleteByCode(String code) {
        Supplier supplier = supplierRepository.findByCode(code)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Supplier not found"));
        supplierRepository.delete(supplier);
    }

    private String generateCode() {
        long next = supplierRepository.count() + 1;
        return String.format("SUP-%03d", next);
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getCode())
                .name(supplier.getName())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .productsProvided(supplier.getProductsProvided())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}
