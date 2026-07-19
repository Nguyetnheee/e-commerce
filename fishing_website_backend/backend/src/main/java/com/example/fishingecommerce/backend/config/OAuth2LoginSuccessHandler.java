package com.example.fishingecommerce.backend.config;
import com.example.fishingecommerce.backend.dto.response.LoginResponse;
import com.example.fishingecommerce.backend.repository.UserRepository;
import com.example.fishingecommerce.backend.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler
        extends SavedRequestAwareAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    public OAuth2LoginSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
@Autowired
    private AuthService authService;
    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        LoginResponse loginResponse = authService.emailLogin(email, name);
        response.sendRedirect(
                "https://fishing-website-fe.vercel.app/auth/callback?token=" + loginResponse.getToken()
        );
    }
}