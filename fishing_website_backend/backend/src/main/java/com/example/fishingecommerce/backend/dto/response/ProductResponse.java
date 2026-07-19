package com.example.fishingecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import com.example.fishingecommerce.backend.enums.ProductUsageType;

@Data
@Builder
@Schema(description = "Thông tin sản phẩm trả về cho admin và public API")
public class ProductResponse {
    private Long id;
    @Schema(description = "Tên sản phẩm")
    private String name;
    @Schema(description = "Ảnh đại diện")
    private String image;
    @Schema(description = "Mô tả")
    private String description;
    @Schema(description = "Chất liệu")
    private String material;
    @Schema(description = "Tính năng / hành động")
    private String action;
    @Schema(description = "Mã sản phẩm cha")
    private String code;
    @Schema(description = "Thời điểm tạo sản phẩm dạng epoch milliseconds")
    private Long time;
    @Schema(description = "Trạng thái hiển thị")
    private Boolean isVisible;
    @Schema(description = "ID danh mục")
    private Long categoryId;
    @Schema(description = "Tên danh mục")
    private String categoryName;
    @Schema(description = "ID thương hiệu")
    private Long brandId;
    @Schema(description = "Tên thương hiệu")
    private String brandName;
    @Schema(description = "ID nhà cung cấp")
    private Long supplierId;
    @Schema(description = "Tên nhà cung cấp")
    private String supplierName;
    @Schema(description = "Loại sử dụng")
    private ProductUsageType usageType;
    @Schema(description = "Danh sách tag")
    private Set<String> tags;
    @Schema(description = "Danh sách biến thể")
    private List<VariantResponse> variants;
}
