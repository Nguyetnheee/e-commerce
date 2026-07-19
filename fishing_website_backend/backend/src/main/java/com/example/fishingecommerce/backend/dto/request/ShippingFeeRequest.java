package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ShippingFeeRequest {
    @NotBlank(message = "Tỉnh/thành phố không được để trống")
    private String province;

    private String district;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<CartItemRequest> items;
}
