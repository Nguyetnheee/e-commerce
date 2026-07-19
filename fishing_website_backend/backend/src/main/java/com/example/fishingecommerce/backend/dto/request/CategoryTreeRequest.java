package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CategoryTreeRequest {
    @Valid
    @NotNull
    private List<CategoryNode> tree;

    @Data
    public static class CategoryNode {
        @NotNull
        private Long id;

        private Long parentId;

        @NotNull
        private Integer sortOrder;
    }
}
