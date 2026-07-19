package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.response.PostResponse;
import com.example.fishingecommerce.backend.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Post (Public)", description = "Public blog post endpoints")
public class PostController {

    private final PostService postService;

    @GetMapping
    @Operation(summary = "Get public post list", description = "Returns all visible posts for the public blog")
    public ResponseEntity<List<PostResponse>> getPublicPosts() {
        return ResponseEntity.ok(postService.findPublicAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get public post detail by id", description = "Returns a visible post by its id")
    public ResponseEntity<PostResponse> getPublicPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.findPublicById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get public post detail by slug", description = "Returns a visible post by its slug")
    public ResponseEntity<PostResponse> getPublicPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.findPublicBySlug(slug));
    }
}
