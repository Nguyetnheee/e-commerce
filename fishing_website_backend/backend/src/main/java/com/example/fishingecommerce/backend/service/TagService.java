package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.TagRequest;
import com.example.fishingecommerce.backend.dto.response.TagResponse;

import java.util.List;

public interface TagService {
    TagResponse createTag(TagRequest request);
    List<TagResponse> findAll();
}
