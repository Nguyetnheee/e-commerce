package com.example.fishingecommerce.backend.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

@Data
public class UpdateRolesRequest {
    @NotBlank
    private String roleName;

    private Set<Long> roleIds;
}
