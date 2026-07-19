package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    @NotBlank(message = "Tên người nhận không được để trống")
    private String recipientName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String recipientPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    private String couponCode;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    @Valid
    private List<CartItemRequest> items;
}
