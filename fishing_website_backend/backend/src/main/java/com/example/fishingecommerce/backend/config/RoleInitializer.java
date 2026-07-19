package com.example.fishingecommerce.backend.config;

import com.example.fishingecommerce.backend.entity.Role;
import com.example.fishingecommerce.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class RoleInitializer {

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            createRoleIfNotFound(roleRepository, "MANAGER");
            createRoleIfNotFound(roleRepository, "APPROVER");
            createRoleIfNotFound(roleRepository, "ADMIN");
            createRoleIfNotFound(roleRepository, "SHIPPER");
            createRoleIfNotFound(roleRepository, "USER");
        };
    }

    private void createRoleIfNotFound(RoleRepository roleRepository, String name) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
        }
    }
}
