package com.astu.ims.controller;

import com.astu.ims.model.Request;
import com.astu.ims.service.RequestService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public List<Request> getAll() {
        return requestService.getAllRequests();
    }

    @PostMapping
    public Request create(@RequestBody Map<String, Object> payload, Authentication auth) {
        Long itemId = Long.valueOf(payload.get("itemId").toString());
        int quantity = Integer.parseInt(payload.get("quantity").toString());
        String reason = payload.getOrDefault("reason", "").toString();
        return requestService.createRequest(itemId, quantity, reason, auth.getName());
    }

    @PutMapping("/{id}/status")
    public Request updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        String status = payload.get("status");
        String comment = payload.getOrDefault("comment", "");
        return requestService.updateStatus(id, status, comment, auth.getName());
    }
}