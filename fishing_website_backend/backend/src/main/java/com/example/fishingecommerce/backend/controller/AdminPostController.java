package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.PostRequest;
import com.example.fishingecommerce.backend.dto.response.PostResponse;
import com.example.fishingecommerce.backend.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/posts")
@RequiredArgsConstructor
@Tag(name = "Admin Post", description = "Quản lý bài viết của Admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminPostController {

    private final PostService postService;

    @PostMapping
    @Operation(summary = "Tạo bài viết mới", description = "Tạo bài viết mới trên hệ thống")
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.createPost(request));
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả bài viết", description = "Lấy danh sách tất cả bài viết")
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(postService.findAll());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bài viết", description = "Xóa bài viết theo ID")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
