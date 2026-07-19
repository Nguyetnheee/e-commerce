package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.PostRequest;
import com.example.fishingecommerce.backend.dto.response.PostResponse;
import com.example.fishingecommerce.backend.entity.Post;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.PostRepository;
import com.example.fishingecommerce.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    @Override
    public PostResponse createPost(PostRequest request) {
        Post post = Post.builder()
                .title(request.getTitle())
                .slug(toSlug(request.getTitle()))
                .htmlContent(request.getHtmlContent())
                .author(request.getAuthor())
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        Post saved = postRepository.save(post);
        return mapToResponse(saved);
    }

    @Override
    public List<PostResponse> findAll() {
        return postRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PostResponse> findPublicAll() {
        return postRepository.findAllByIsVisibleTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PostResponse findPublicById(Long id) {
        Post post = postRepository.findByIdAndIsVisibleTrue(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Bai viet khong ton tai"));
        return mapToResponse(post);
    }

    @Override
    public PostResponse findPublicBySlug(String slug) {
        Post post = postRepository.findBySlugAndIsVisibleTrue(slug)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Bai viet khong ton tai"));
        return mapToResponse(post);
    }

    @Override
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Bai viet khong ton tai"));
        postRepository.delete(post);
    }

    private PostResponse mapToResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .htmlContent(post.getHtmlContent())
                .author(post.getAuthor())
                .isVisible(post.getIsVisible())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private String toSlug(String input) {
        return input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
