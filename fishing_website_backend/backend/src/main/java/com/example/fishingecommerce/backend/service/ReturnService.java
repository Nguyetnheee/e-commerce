package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.CreateReturnRequest;
import com.example.fishingecommerce.backend.dto.response.ReturnActionResponse;
import com.example.fishingecommerce.backend.dto.response.ReturnRequestResponse;

import java.util.List;

public interface ReturnService {
    List<ReturnRequestResponse> findAll();
    ReturnRequestResponse create(CreateReturnRequest request);
    ReturnActionResponse restock(String code);
    ReturnActionResponse dispose(String code);
}
