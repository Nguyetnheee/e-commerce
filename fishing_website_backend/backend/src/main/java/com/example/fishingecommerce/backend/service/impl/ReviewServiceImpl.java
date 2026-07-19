package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.ReviewRequest;
import com.example.fishingecommerce.backend.dto.response.ReviewResponse;
import com.example.fishingecommerce.backend.entity.Order;
import com.example.fishingecommerce.backend.entity.OrderItem;
import com.example.fishingecommerce.backend.entity.Product;
import com.example.fishingecommerce.backend.entity.Review;
import com.example.fishingecommerce.backend.entity.User;
import com.example.fishingecommerce.backend.enums.OrderStatus;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.exceptions.ResourceNotFoundException;
import com.example.fishingecommerce.backend.repository.OrderRepository;
import com.example.fishingecommerce.backend.repository.ProductRepository;
import com.example.fishingecommerce.backend.repository.ReviewRepository;
import com.example.fishingecommerce.backend.repository.UserRepository;
import com.example.fishingecommerce.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    public Page<ReviewResponse> getReviewsByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviews = reviewRepository.findByProductId(productId, pageable);
        return reviews.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn hàng không thuộc về bạn");
        }
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Bạn chỉ có thể đánh giá sau khi xác nhận đã nhận hàng");
        }

        boolean hasProduct = false;
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProduct() != null && item.getProduct().getId().equals(request.getProductId())) {
                    hasProduct = true;
                    break;
                }
            }
        }
        if (!hasProduct) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Sản phẩm không có trong đơn hàng này");
        }

        if (reviewRepository.existsByOrderIdAndProductIdAndUserId(order.getId(), product.getId(), user.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .text(request.getText())
                .images(request.getImages())
                .build();

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể sửa đánh giá của chính mình");
        }
        if (!review.getOrder().getId().equals(request.getOrderId())
                || !review.getProduct().getId().equals(request.getProductId())) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Không thể thay đổi đơn hàng hoặc sản phẩm của đánh giá");
        }
        review.setRating(request.getRating());
        review.setText(request.getText());
        review.setImages(request.getImages());
        return mapToResponse(reviewRepository.saveAndFlush(review));
    }

    @Override
    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá"));
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể xóa đánh giá của chính mình");
        }
        reviewRepository.delete(review);
    }

    @Override
    public Page<ReviewResponse> getAllReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return reviewRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<ReviewResponse> getMyReviews(Long userId) {
        return reviewRepository.findByUserId(userId).stream().map(this::mapToResponse).toList();
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .orderId(review.getOrder().getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullname() != null ? review.getUser().getFullname() : review.getUser().getEmail())
                .rating(review.getRating())
                .text(review.getText())
                .images(review.getImages())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
