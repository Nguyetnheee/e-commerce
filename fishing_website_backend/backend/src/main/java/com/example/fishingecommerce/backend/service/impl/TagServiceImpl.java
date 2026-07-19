package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.dto.request.TagRequest;
import com.example.fishingecommerce.backend.dto.response.TagResponse;
import com.example.fishingecommerce.backend.entity.Tag;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.TagRepository;
import com.example.fishingecommerce.backend.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public TagResponse createTag(TagRequest request) {
        if (tagRepository.findByName(request.getTagName()).isPresent()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tag đã tồn tại");
        }
        Tag tag = new Tag();
        tag.setName(request.getTagName());
        Tag saved = tagRepository.save(tag);
        return TagResponse.builder().id(saved.getId()).name(saved.getName()).build();
    }

    @Override
    public List<TagResponse> findAll() {
        return tagRepository.findAll().stream()
                .map(t -> TagResponse.builder().id(t.getId()).name(t.getName()).build())
                .collect(Collectors.toList());
    }
}
