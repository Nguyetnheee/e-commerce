package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDetailResponse {
    private Long id;
    private String name;
    private Integer sortOrder;
    private Long parentId;
    private String parentName;
    private Long productCount;
    private Long childCount;
}
