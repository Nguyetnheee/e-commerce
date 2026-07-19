package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrandDetailResponse {
    private Long id;
    private String name;
    private String country;
    private Long productCount;
}
