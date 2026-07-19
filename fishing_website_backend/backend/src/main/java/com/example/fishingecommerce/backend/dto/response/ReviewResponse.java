package com.example.fishingecommerce.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ReviewResponse {
    private Long id;
    private Long orderId;
    private Long productId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String text;
    private List<String> images;
    private LocalDateTime createdAt;
}
