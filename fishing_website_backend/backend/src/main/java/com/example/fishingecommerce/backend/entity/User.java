package com.example.fishingecommerce.backend.entity;

import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import com.example.fishingecommerce.backend.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name= "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Fullname")
    private String fullname;

    @Column(name = "Email", unique = true)
    private String email;

    @Column(name = "Password")
    private String password;

    @Column(name = "Address")
    private String address;

    @Column(name = "Phone")
    private String phone;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UserAccountStatus status = UserAccountStatus.ACTIVE;

    @Column(name = "Dob")
    private String dob;

    @Column(name = "Gender")
    private String gender;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "UserRoles",
            joinColumns = @JoinColumn(name = "UserID"),
            inverseJoinColumns = @JoinColumn(name = "RoleID")
    )
    private Set<Role> roles;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;

    @Column(name = "CreatedAt")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "UpdatedAt")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
