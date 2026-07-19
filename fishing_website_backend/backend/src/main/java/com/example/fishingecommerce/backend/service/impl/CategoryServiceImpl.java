package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.CreateCategoryRequest;
import com.example.fishingecommerce.backend.dto.request.CategoryTreeRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateCategoryRequest;
import com.example.fishingecommerce.backend.entity.Category;
import com.example.fishingecommerce.backend.dto.response.CategoryDetailResponse;
import com.example.fishingecommerce.backend.dto.response.CategoryResponse;
import com.example.fishingecommerce.backend.entity.Product;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.CategoryRepository;
import com.example.fishingecommerce.backend.repository.ProductRepository;
import com.example.fishingecommerce.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void updateTree(CategoryTreeRequest request) {
        List<Long> ids = request.getTree().stream().map(CategoryTreeRequest.CategoryNode::getId).collect(Collectors.toList());
        Map<Long, Category> categories = categoryRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        for (CategoryTreeRequest.CategoryNode node : request.getTree()) {
            Category category = categories.get(node.getId());
            if (category == null) {
                throw new AppException(HttpStatus.NOT_FOUND, "Danh mục không tồn tại: " + node.getId());
            }
            category.setSortOrder(node.getSortOrder());
            if (node.getParentId() != null) {
                Category parent = categoryRepository.findById(node.getParentId())
                        .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Danh mục cha không tồn tại"));
                category.setParent(parent);
            } else {
                category.setParent(null);
            }
        }

        categoryRepository.saveAll(categories.values());
    }

    @Override
    public List<Category> getTree() {
        return categoryRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getPublicTree() {
        Map<Long, CategoryResponse> categories = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(
                        Category::getId,
                        category -> CategoryResponse.builder()
                                .id(category.getId())
                                .name(category.getName())
                                .sortOrder(category.getSortOrder())
                                .children(new ArrayList<>())
                                .build()));

        List<CategoryResponse> roots = new ArrayList<>();
        for (Category category : categoryRepository.findAll()) {
            CategoryResponse node = categories.get(category.getId());
            if (category.getParent() == null || !categories.containsKey(category.getParent().getId())) {
                roots.add(node);
            } else {
                categories.get(category.getParent().getId()).getChildren().add(node);
            }
        }

        Comparator<CategoryResponse> order = Comparator
                .comparing(CategoryResponse::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(CategoryResponse::getName, Comparator.nullsLast(String::compareToIgnoreCase));
        sortTree(roots, order);
        return roots;
    }

    private void sortTree(List<CategoryResponse> categories, Comparator<CategoryResponse> order) {
        categories.sort(order);
        categories.forEach(category -> sortTree(category.getChildren(), order));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryDetailResponse findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Danh muc khong ton tai"));

        return CategoryDetailResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .sortOrder(category.getSortOrder())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .productCount(productRepository.countByCategory_Id(id))
                .childCount(categoryRepository.countByParent_Id(id))
                .build();
    }

    @Override
    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        String name = normalizeName(request.getName());
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new AppException(HttpStatus.CONFLICT, "Danh muc da ton tai");
        }

        Category parent = resolveParent(request.getParentId(), null);
        Category category = Category.builder()
                .name(name)
                .parent(parent)
                .sortOrder(0)
                .build();
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Danh muc khong ton tai"));

        String name = normalizeName(request.getName());
        boolean duplicate = categoryRepository.findAll().stream()
                .anyMatch(existing -> existing.getId() != null
                        && !existing.getId().equals(id)
                        && existing.getName() != null
                        && existing.getName().equalsIgnoreCase(name));
        if (duplicate) {
            throw new AppException(HttpStatus.CONFLICT, "Danh muc da ton tai");
        }

        category.setName(name);
        category.setParent(resolveParent(request.getParentId(), id));
        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Danh muc khong ton tai"));

        if (productRepository.existsByCategory_Id(id)) {
            throw new AppException(HttpStatus.CONFLICT, "Danh muc dang duoc gan voi san pham");
        }
        if (categoryRepository.countByParent_Id(id) > 0) {
            throw new AppException(HttpStatus.CONFLICT, "Danh muc dang co danh muc con");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .sortOrder(category.getSortOrder())
                .children(new ArrayList<>())
                .build();
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ten danh muc khong duoc de trong");
        }
        return name.trim();
    }

    private Category resolveParent(Long parentId, Long currentId) {
        if (parentId == null) {
            return null;
        }
        if (currentId != null && parentId.equals(currentId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Danh muc cha khong hop le");
        }
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Danh muc cha khong ton tai"));
        return parent;
    }
}
