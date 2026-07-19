package com.example.fishingecommerce.backend.dto.request;

import lombok.Data;

import java.util.Set;

@Data
public class UpdateRolesRequest {
    private Set<Long> roleIds;
}
