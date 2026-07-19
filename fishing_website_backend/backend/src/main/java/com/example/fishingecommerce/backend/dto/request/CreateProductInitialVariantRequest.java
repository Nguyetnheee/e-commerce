package com.example.fishingecommerce.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Biến thể đầu tiên đi kèm khi tạo product full")
public class CreateProductInitialVariantRequest {
    @NotBlank
    @Schema(description = "SKU của biến thể", example = "WS-PROD-7755B")
    private String sku;

    @JsonAlias("name")
    @NotBlank
    @Schema(description = "Tên biến thể", example = "Mac dinh")
    private String variantName;

    @NotNull
    @Schema(description = "Giá gốc", example = "5000000")
    private BigDecimal basePrice;

    @Schema(description = "Giá khuyến mãi nếu có", example = "4500000")
    private BigDecimal discountPrice;

    @NotNull
    @Schema(description = "Tồn kho ban đầu", example = "10")
    private Integer stockQuantity;
}
