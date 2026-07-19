package com.example.fishingecommerce.backend.repository;
import com.example.fishingecommerce.backend.entity.User;
import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import com.example.fishingecommerce.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    Optional<User> findUserByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByStatus(UserAccountStatus status);
}
