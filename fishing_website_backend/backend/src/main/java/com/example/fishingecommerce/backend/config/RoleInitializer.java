package com.example.fishingecommerce.backend.config;

import com.example.fishingecommerce.backend.entity.Role;
import com.example.fishingecommerce.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class RoleInitializer {

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository, JdbcTemplate jdbcTemplate) {
        return args -> {
            // Older deployments used a MySQL ENUM that cannot store the SHIPPER role.
            jdbcTemplate.execute("ALTER TABLE Users MODIFY COLUMN role VARCHAR(32)");
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
