package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.ReviewRequest;
import com.example.fishingecommerce.backend.dto.response.ReviewResponse;
import com.example.fishingecommerce.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "Quản lý đánh giá sản phẩm")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/me")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(Authentication authentication) {
        return ResponseEntity.ok(reviewService.getMyReviews(Long.valueOf(authentication.getName())));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách đánh giá của sản phẩm", description = "Lấy danh sách comment, điểm sao, và ảnh thực tế có phân trang")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @RequestParam Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId, page, size));
    }

    @PostMapping
    @Operation(summary = "Thêm đánh giá mới", description = "Khách hàng đánh giá số sao, nhập text và upload tối đa 3 ảnh")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ReviewResponse> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(reviewService.createReview(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(
                Long.valueOf(authentication.getName()), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            Authentication authentication) {
        reviewService.deleteReview(Long.valueOf(authentication.getName()), id);
        return ResponseEntity.noContent().build();
    }
}
