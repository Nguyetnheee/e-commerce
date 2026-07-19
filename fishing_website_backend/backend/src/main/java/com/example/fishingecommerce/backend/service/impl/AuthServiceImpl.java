package com.example.fishingecommerce.backend.service.impl;

import com.example.fishingecommerce.backend.config.JwtService;
import com.example.fishingecommerce.backend.dto.request.AdminLoginRequest;
import com.example.fishingecommerce.backend.dto.request.LoginRequest;
import com.example.fishingecommerce.backend.dto.request.NewPasswordRequest;
import com.example.fishingecommerce.backend.dto.request.RegisterRequest;
import com.example.fishingecommerce.backend.dto.request.RegisterStaffRequest;
import com.example.fishingecommerce.backend.dto.request.SetupFirstAdminRequest;
import com.example.fishingecommerce.backend.dto.response.LoginResponse;
import com.example.fishingecommerce.backend.dto.response.NewPasswordResponse;
import com.example.fishingecommerce.backend.dto.response.RegisterResponse;
import com.example.fishingecommerce.backend.entity.Role;
import com.example.fishingecommerce.backend.entity.User;
import com.example.fishingecommerce.backend.enums.UserAccountStatus;
import com.example.fishingecommerce.backend.enums.UserRole;
import com.example.fishingecommerce.backend.exceptions.AppException;
import com.example.fishingecommerce.backend.repository.RoleRepository;
import com.example.fishingecommerce.backend.repository.UserRepository;
import com.example.fishingecommerce.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Set<String> ADMIN_ROLE_NAMES = Set.of("ADMIN", "MANAGER", "APPROVER");

    private final UserRepository userRepo;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${admin.staff.secret-key:}")
    private String adminStaffSecretKey;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepo.findUserByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST , "Email khong ton tai"));

        ensureActive(user);

        boolean ok = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if(!ok){
            throw  new AppException(HttpStatus.UNAUTHORIZED,"Email hoac mat khau sai");
        }
        return buildLoginResponse(user);
    }

    @Override
    public LoginResponse adminLogin(AdminLoginRequest loginRequest) {
        User user = userRepo.findUserByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Email khong ton tai"));

        ensureActive(user);

        boolean ok = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (!ok) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Email hoac mat khau sai");
        }

        if (!isAdminAccount(user)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tai khoan khong co quyen truy cap CMS");
        }

        return buildLoginResponse(user);
    }

    @Override
    public RegisterResponse register(RegisterRequest registerRequest) {
        if (userRepo.existsByEmail(registerRequest.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email da ton tai");
        }
        User users = User.builder()
                .email(registerRequest.getEmail())
                .fullname(registerRequest.getFullname())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(UserRole.USER)
                .status(UserAccountStatus.ACTIVE)
                .build();
        User saveUser = userRepo.save(users);
        return new RegisterResponse(
                saveUser.getFullname(),
                "Thanh cong",
                saveUser.getEmail()
        );
    }

    @Override
    public LoginResponse emailLogin(String email,String fullname) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        User user = userRepo.findUserByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullname(fullname);
            newUser.setRole(UserRole.USER);
            newUser.setStatus(UserAccountStatus.ACTIVE);
            return userRepo.save(newUser);
        });

        ensureActive(user);
        return buildLoginResponse(user);
    }

    @Override
    public NewPasswordResponse changePass(NewPasswordRequest request) {
        User user = userRepo.findUserByEmail(request.getEmail()).orElseThrow(()
                -> new AppException(HttpStatus.BAD_REQUEST , "Email khong ton tai"));
        ensureActive(user);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
        return NewPasswordResponse.builder().newPassword(request.getNewPassword()).build();
    }

    @Override
    public LoginResponse setupFirstAdmin(SetupFirstAdminRequest request) {
        boolean hasAdmin = userRepo.findAll().stream().anyMatch(this::isAdminAccount);
        if (hasAdmin) {
            throw new AppException(HttpStatus.FORBIDDEN, "He thong da co admin dau tien");
        }
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email da ton tai");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Role ADMIN chua duoc khoi tao"));

        User user = User.builder()
                .fullname(request.getFullname() != null && !request.getFullname().isBlank() ? request.getFullname() : request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ADMIN)
                .roles(Set.of(adminRole))
                .status(UserAccountStatus.ACTIVE)
                .build();

        return buildLoginResponse(userRepo.save(user));
    }

    @Override
    public LoginResponse registerStaff(RegisterStaffRequest request) {
        if (adminStaffSecretKey == null || adminStaffSecretKey.isBlank()) {
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Admin staff secret key chua duoc cau hinh");
        }
        if (!adminStaffSecretKey.equals(request.getAdminSecretKey())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Admin secret key khong hop le");
        }
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email da ton tai");
        }

        String requestedRole = request.getRole().trim().toUpperCase(Locale.ROOT);
        Role staffRole = roleRepository.findByName(requestedRole)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Role khong hop le"));

        UserRole primaryRole = switch (requestedRole) {
            case "ADMIN" -> UserRole.ADMIN;
            case "MANAGER", "APPROVER" -> UserRole.MANAGER;
            default -> throw new AppException(HttpStatus.BAD_REQUEST, "Role khong hop le");
        };

        User user = User.builder()
                .email(request.getEmail())
                .fullname(request.getFullname())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(primaryRole)
                .roles(Set.of(staffRole))
                .status(UserAccountStatus.ACTIVE)
                .build();

        return buildLoginResponse(userRepo.save(user));
    }

    private LoginResponse buildLoginResponse(User user) {
        String token = jwtService.generateToken(user);
        return LoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .role(user.getRole())
                .token(token)
                .build();
    }

    private void ensureActive(User user) {
        if (user.getStatus() != null && user.getStatus() != UserAccountStatus.ACTIVE) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tai khoan da bi khoa hoac vo hieu hoa");
        }
    }

    private boolean isAdminAccount(User user) {
        if (user.getRole() != null && ADMIN_ROLE_NAMES.contains(user.getRole().name())) {
            return true;
        }
        return user.getRoles() != null
                && user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()).stream().anyMatch(ADMIN_ROLE_NAMES::contains);
    }
}
