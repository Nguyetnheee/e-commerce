package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Set;

import com.example.fishingecommerce.backend.enums.ProductUsageType;

@Data
@Schema(description = "Request tạo sản phẩm mới")
public class CreateProductRequest {
    @NotBlank
    @Schema(description = "Tên sản phẩm", example = "Can cau Lure Bien Carbon")
    private String name;

    @Schema(description = "Đường dẫn ảnh đại diện sản phẩm", example = "/images/product-rod.png")
    private String image;

    @Schema(description = "Mô tả sản phẩm")
    private String description;

    @Schema(description = "Chất liệu sản phẩm", example = "Carbon")
    private String material;

    @Schema(description = "Tính năng / hành động của sản phẩm", example = "Casting")
    private String action;

    @Schema(description = "Mã sản phẩm cha", example = "PROD-000123")
    private String code;

    @Schema(description = "Thời điểm tạo sản phẩm dạng epoch milliseconds", example = "1752891240000")
    private Long time;

    @NotNull
    @Schema(description = "ID danh mục con của sản phẩm", example = "5")
    private Long categoryId;

    @NotNull
    @Schema(description = "ID thương hiệu", example = "2")
    private Long brandId;

    @Schema(description = "Loại sử dụng của sản phẩm; có thể bỏ trống nếu backend suy ra từ danh mục cha", example = "BIEN")
    private ProductUsageType usageType;

    @Schema(description = "ID nhà cung cấp", example = "1")
    private Long supplierId;

    @Schema(description = "Danh sách tag ID gắn với sản phẩm")
    private Set<Long> tagIds;

    @Schema(description = "Trạng thái hiển thị sản phẩm", example = "true")
    private Boolean isVisible;
}
