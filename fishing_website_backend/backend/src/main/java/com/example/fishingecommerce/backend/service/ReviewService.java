package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.ReviewRequest;
import com.example.fishingecommerce.backend.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import java.util.List;

public interface ReviewService {
    Page<ReviewResponse> getReviewsByProduct(Long productId, int page, int size);
    ReviewResponse createReview(Long userId, ReviewRequest request);
    ReviewResponse updateReview(Long userId, Long reviewId, ReviewRequest request);
    void deleteReview(Long userId, Long reviewId);
    Page<ReviewResponse> getAllReviews(int page, int size);
    List<ReviewResponse> getMyReviews(Long userId);
}
