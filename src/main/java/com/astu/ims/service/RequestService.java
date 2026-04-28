package com.astu.ims.service;

import com.astu.ims.model.*;
import com.astu.ims.repository.RequestRepository;
import com.astu.ims.repository.UserRepository;
import com.astu.ims.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RequestService {
    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final NotificationService notificationService;

    public RequestService(RequestRepository requestRepository, 
                          UserRepository userRepository,
                          ItemRepository itemRepository,
                          NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.notificationService = notificationService;
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public Request getRequestById(Long id) {
        return requestRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Request createRequest(Long itemId, int quantity, String reason, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail).orElseThrow();
        Item item = itemRepository.findById(itemId).orElseThrow();
        
        if (quantity > item.getQuantity()) {
            throw new RuntimeException("Requested quantity exceeds available stock.");
        }

        Request request = new Request();
        request.setUser(requester);
        request.setItem(item);
        request.setQuantity(quantity);
        request.setReason(reason);
        request.setDepartment(requester.getDepartment());
        request.setStatus("PENDING_DH_APPROVAL");
        request.setCreatedAt(LocalDateTime.now());
        
        Request saved = requestRepository.save(request);
        notificationService.createNotification(requester, "Your request for " + item.getName() + " has been submitted for DH approval.");
        
        // Notify DH of the department
        userRepository.findAll().stream()
            .filter(u -> "dept_head".equals(u.getRole()) && u.getDepartment() != null && u.getDepartment().equals(requester.getDepartment()))
            .forEach(h -> notificationService.createNotification(h, "New item request from " + requester.getName()));
            
        return saved;
    }

    @Transactional
    public Request updateStatus(Long requestId, String newStatus, String comment, String approverEmail) {
        Request request = getRequestById(requestId);
        User approver = userRepository.findByEmail(approverEmail).orElseThrow();
        
        request.setStatus(newStatus);
        request.setOutcome(comment); // Store comment in outcome field
        
        if (!"RETURN_PENDING".equals(newStatus)) {
            request.setApprovedBy(approver);
        }

        Request saved = requestRepository.save(request);
        
        // Notify transitions
        if ("APPROVED_BY_DH".equals(newStatus)) {
            notificationService.createNotification(request.getUser(), "Your request was approved by DH. Waiting for Inventory Officer verification.");
            // Notify Inventory Officers
            userRepository.findAll().stream()
                .filter(u -> "inventory_officer".equals(u.getRole()))
                .forEach(o -> notificationService.createNotification(o, "Request " + request.getId() + " requires stock verification."));
        } else if ("REJECTED".equals(newStatus)) {
            notificationService.createNotification(request.getUser(), "Your request was rejected by DH: " + comment);
        } else if ("APPROVED_FOR_ISSUANCE".equals(newStatus)) {
            notificationService.createNotification(request.getUser(), "Stock verified. Item ready for issuance.");
            // Notify Storekeepers
            userRepository.findAll().stream()
                .filter(u -> "storekeeper".equals(u.getRole()))
                .forEach(s -> notificationService.createNotification(s, "Request " + request.getId() + " is ready for issuance."));
        } else if ("REJECTED_STOCK".equals(newStatus)) {
            notificationService.createNotification(request.getUser(), "Request rejected due to stock unavailability.");
        } else if ("RETURN_PENDING".equals(newStatus)) {
            notificationService.createNotification(approver, "Return request submitted for " + request.getItem().getName());
        }

        return saved;
    }
}