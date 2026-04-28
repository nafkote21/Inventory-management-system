package com.astu.ims.controller;

import com.astu.ims.model.User;
import com.astu.ims.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        
        Map<String, Object> userInfo = new HashMap<>();
        if (user != null) {
            userInfo.put("fullName", user.getName());
            userInfo.put("email", user.getEmail());
            userInfo.put("role", user.getRole());
        }
        return userInfo;
    }
}