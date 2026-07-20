package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateReturnRequest;
import com.example.fishingecommerce.backend.dto.response.ReturnRequestResponse;
import com.example.fishingecommerce.backend.service.ReturnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
@Tag(name = "Customer Returns", description = "Customer return & refund request endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class PublicReturnController {

    private final ReturnService returnService;

    @GetMapping
    @Operation(summary = "List all return requests for user/admin")
    public ResponseEntity<List<ReturnRequestResponse>> getReturns() {
        return ResponseEntity.ok(returnService.findAll());
    }

    @PostMapping
    @Operation(summary = "Customer create return & refund request (SOP-009)")
    public ResponseEntity<ReturnRequestResponse> createReturn(@Valid @RequestBody CreateReturnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(returnService.create(request));
    }
}
