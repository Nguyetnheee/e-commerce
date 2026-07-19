package com.example.fishingecommerce.backend.dto.request;

import lombok.Data;

@Data
public class InspectionChecklistRequest {
    private Boolean quantityMatched;
    private Boolean packagingIntact;
    private Boolean modelCorrect;
    private Boolean conditionGood;
    private Boolean accessoriesIncluded;
    private Boolean warrantyCardIncluded;
}
