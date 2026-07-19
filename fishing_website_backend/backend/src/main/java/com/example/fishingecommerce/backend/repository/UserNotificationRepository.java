package com.example.fishingecommerce.backend.repository;

import com.example.fishingecommerce.backend.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
}
