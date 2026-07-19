package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByIsVisibleTrueOrderByCreatedAtDesc();

    Optional<Post> findByIdAndIsVisibleTrue(Long id);

    Optional<Post> findBySlugAndIsVisibleTrue(String slug);
}
