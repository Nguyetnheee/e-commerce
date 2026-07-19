package com.example.fishingecommerce.backend.controller;

import com.example.fishingecommerce.backend.dto.response.UserNotificationResponse;
import com.example.fishingecommerce.backend.entity.UserNotification;
import com.example.fishingecommerce.backend.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class UserNotificationController {
    private final UserNotificationRepository notificationRepository;

    @GetMapping("/me")
    public ResponseEntity<List<UserNotificationResponse>> getMine(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::map).toList());
    }

    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        List<UserNotification> notifications =
                notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(item -> item.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.noContent().build();
    }

    private UserNotificationResponse map(UserNotification item) {
        return UserNotificationResponse.builder()
                .id(item.getId())
                .message(item.getMessage())
                .type(item.getType())
                .read(item.isRead())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
