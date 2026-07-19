package com.example.fishingecommerce.backend.service;

import com.example.fishingecommerce.backend.dto.request.PostRequest;
import com.example.fishingecommerce.backend.dto.response.PostResponse;

import java.util.List;

public interface PostService {
    PostResponse createPost(PostRequest request);
    List<PostResponse> findAll();
    List<PostResponse> findPublicAll();
    PostResponse findPublicById(Long id);
    PostResponse findPublicBySlug(String slug);
    void deletePost(Long id);
}
