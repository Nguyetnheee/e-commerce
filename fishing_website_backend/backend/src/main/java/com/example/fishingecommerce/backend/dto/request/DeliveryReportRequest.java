package com.example.fishingecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DeliveryReportRequest {
    @NotBlank(message = "Vui lòng mô tả tình trạng chưa nhận được hàng")
    @Size(max = 1000, message = "Nội dung báo cáo tối đa 1000 ký tự")
    private String reason;
}
