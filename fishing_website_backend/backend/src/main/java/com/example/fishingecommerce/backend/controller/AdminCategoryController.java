package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateCategoryRequest;
import com.example.fishingecommerce.backend.dto.request.CategoryTreeRequest;
import com.example.fishingecommerce.backend.dto.request.UpdateCategoryRequest;
import com.example.fishingecommerce.backend.dto.response.CategoryDetailResponse;
import com.example.fishingecommerce.backend.dto.response.CategoryResponse;
import com.example.fishingecommerce.backend.entity.Category;
import com.example.fishingecommerce.backend.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Admin Category", description = "Quản lý danh mục sản phẩm của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PutMapping("/tree")
    @Operation(summary = "Cập nhật cấu trúc cây danh mục", description = "Cập nhật thứ tự hiển thị và mối quan hệ cha-con của các danh mục")
    public ResponseEntity<Void> updateTree(@Valid @RequestBody CategoryTreeRequest request) {
        categoryService.updateTree(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tree")
    @Operation(summary = "Lấy cấu trúc cây danh mục", description = "Lấy danh sách danh mục phân cấp theo dạng cây")
    public ResponseEntity<List<Category>> getTree() {
        return ResponseEntity.ok(categoryService.getTree());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lay chi tiet danh muc")
    public ResponseEntity<CategoryDetailResponse> getCategoryDetail(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Tao moi danh muc")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cap nhat danh muc")
    public ResponseEntity<CategoryResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xoa danh muc")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
