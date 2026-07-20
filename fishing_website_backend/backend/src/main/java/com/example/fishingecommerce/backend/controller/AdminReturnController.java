package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.request.CreateReturnRequest;
import com.example.fishingecommerce.backend.dto.response.ReturnActionResponse;
import com.example.fishingecommerce.backend.dto.response.ReturnRequestResponse;
import com.example.fishingecommerce.backend.service.ReturnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/returns")
@RequiredArgsConstructor
@Tag(name = "Admin Returns", description = "Returns and disposal flow")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminReturnController {

    private final ReturnService returnService;

    @GetMapping
    @Operation(summary = "List return requests")
    public ResponseEntity<List<ReturnRequestResponse>> getReturns() {
        return ResponseEntity.ok(returnService.findAll());
    }

    @PostMapping
    @Operation(summary = "Create return request")
    public ResponseEntity<ReturnRequestResponse> createReturn(@Valid @RequestBody CreateReturnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(returnService.create(request));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve return request")
    public ResponseEntity<ReturnActionResponse> approve(@PathVariable String id) {
        return ResponseEntity.ok(returnService.approve(id));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject return request")
    public ResponseEntity<ReturnActionResponse> reject(@PathVariable String id, @RequestBody(required = false) java.util.Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(returnService.reject(id, reason));
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Confirm bank transfer refund completed (SOP-009)")
    public ResponseEntity<ReturnActionResponse> refund(@PathVariable String id) {
        return ResponseEntity.ok(returnService.refund(id));
    }

    @PostMapping("/{id}/restock")
    @Operation(summary = "Restock return (Policy 17.6)")
    public ResponseEntity<ReturnActionResponse> restock(@PathVariable String id) {
        return ResponseEntity.ok(returnService.restock(id));
    }

    @PostMapping("/{id}/dispose")
    @Operation(summary = "Dispose return (Policy 17.6 damaged stock)")
    public ResponseEntity<ReturnActionResponse> dispose(@PathVariable String id) {
        return ResponseEntity.ok(returnService.dispose(id));
    }
}
