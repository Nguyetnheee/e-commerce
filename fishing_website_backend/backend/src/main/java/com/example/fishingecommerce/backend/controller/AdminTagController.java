package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.TagRequest;
import com.example.fishingecommerce.backend.dto.response.TagResponse;
import com.example.fishingecommerce.backend.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tags")
@RequiredArgsConstructor
@Tag(name = "Admin Tag", description = "Quản lý thẻ (tag) sản phẩm của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminTagController {

    private final TagService tagService;

    @PostMapping
    @Operation(summary = "Tạo thẻ mới", description = "Tạo thẻ sản phẩm mới trên hệ thống")
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody TagRequest request) {
        return ResponseEntity.ok(tagService.createTag(request));
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả thẻ", description = "Lấy danh sách tất cả thẻ sản phẩm")
    public ResponseEntity<List<TagResponse>> getAllTags() {
        return ResponseEntity.ok(tagService.findAll());
    }
}
