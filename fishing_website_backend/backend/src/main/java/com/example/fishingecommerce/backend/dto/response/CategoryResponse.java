package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private Integer sortOrder;
    private List<CategoryResponse> children;
}
