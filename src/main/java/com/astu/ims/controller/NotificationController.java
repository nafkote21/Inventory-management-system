package com.astu.ims.controller;

import com.astu.ims.model.Notification;
import com.astu.ims.model.User;
import com.astu.ims.repository.UserRepository;
import com.astu.ims.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Notification> getMyNotifications(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return notificationService.getNotificationsForUser(user.getId());
    }
}