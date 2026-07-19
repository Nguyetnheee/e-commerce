package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateCategoryRequest;
import com.example.fishingecommerce.backend.dto.request.CategoryTreeRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateCategoryRequest;
import com.example.fishingecommerce.backend.entity.Category;
import com.example.fishingecommerce.backend.dto.response.CategoryDetailResponse;
import com.example.fishingecommerce.backend.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    void updateTree(CategoryTreeRequest request);
    List<Category> getTree();
    List<CategoryResponse> getPublicTree();
    CategoryDetailResponse findById(Long id);
    CategoryResponse create(CreateCategoryRequest request);
    CategoryResponse update(Long id, UpdateCategoryRequest request);
    void delete(Long id);
}
