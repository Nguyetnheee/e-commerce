package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.response.TagResponse;
import com.example.fishingecommerce.backend.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@Tag(name = "Tag (Public)", description = "The san pham cong khai")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Lay danh sach the san pham")
    public ResponseEntity<List<TagResponse>> getAllTags() {
        return ResponseEntity.ok(tagService.findAll());
    }
}
