package com.example.fishingecommerce.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class OrderStatusSchemaInitializer {

    @Bean
    @Order(0)
    public CommandLineRunner migrateOrderStatusColumns(JdbcTemplate jdbcTemplate) {
        return args -> {
            // MySQL does not reliably expand existing ENUM columns through
            // Hibernate ddl-auto=update. VARCHAR keeps EnumType.STRING safe
            // when new lifecycle statuses are added.
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(32)");
            jdbcTemplate.execute("ALTER TABLE shipping_events MODIFY COLUMN status VARCHAR(32) NOT NULL");
        };
    }
}
