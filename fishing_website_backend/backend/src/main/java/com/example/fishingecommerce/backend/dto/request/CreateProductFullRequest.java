package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.EqualsAndHashCode;
import lombok.Data;

@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "Request tạo sản phẩm kèm biến thể đầu tiên trong một lần gọi")
public class CreateProductFullRequest extends CreateProductRequest {
    @NotNull
    @Valid
    @Schema(description = "Thông tin biến thể đầu tiên sẽ được tạo cùng sản phẩm")
    private CreateProductInitialVariantRequest initialVariant;
}
