package com.example.fishingecommerce.backend.dto.response;

import com.example.fishingecommerce.backend.enums.ReturnRequestStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReturnActionResponse {
    private String returnId;
    private ReturnRequestStatus status;
    private String message;
    private Integer newStock;
}
