package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.ReviewRequest;
import com.example.fishingecommerce.backend.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;

public interface ReviewService {
    Page<ReviewResponse> getReviewsByProduct(Long productId, int page, int size);
    ReviewResponse createReview(Long userId, ReviewRequest request);
}
