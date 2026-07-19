package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FailDeliveryRequest {
    @NotBlank(message = "Bắt buộc chọn lý do giao hàng không thành công")
    private String reason;
}
