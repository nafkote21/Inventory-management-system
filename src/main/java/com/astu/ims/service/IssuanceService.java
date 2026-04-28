package com.astu.ims.service;

import com.astu.ims.model.*;
import com.astu.ims.repository.IssuedItemRepository;
import com.astu.ims.repository.RequestRepository;
import com.astu.ims.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class IssuanceService {
    private final IssuedItemRepository issuedItemRepository;
    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    public IssuanceService(IssuedItemRepository issuedItemRepository, 
                           RequestRepository requestRepository, 
                           UserRepository userRepository,
                           InventoryService inventoryService,
                           NotificationService notificationService) {
        this.issuedItemRepository = issuedItemRepository;
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.inventoryService = inventoryService;
        this.notificationService = notificationService;
    }

    @Transactional
    public IssuedItem issueItem(Long requestId, String issuerEmail) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        User issuer = userRepository.findByEmail(issuerEmail).orElseThrow();
        
        if (!"APPROVED_FOR_ISSUANCE".equals(request.getStatus())) {
            throw new RuntimeException("Request must be approved for issuance by Inventory Officer.");
        }

        Item item = request.getItem();
        if (item.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock for issuance.");
        }

        // Update stock
        item.setQuantity(item.getQuantity() - request.getQuantity());
        inventoryService.updateItem(item.getId(), item);

        // Record issuance
        IssuedItem issuance = new IssuedItem();
        issuance.setRequest(request);
        issuance.setIssuedTo(request.getUser());
        issuance.setIssuedBy(issuer);
        issuance.setQuantity(request.getQuantity());
        issuance.setReturnStatus("NOT_RETURNED");
        issuance.setIssuedAt(LocalDateTime.now());
        
        request.setStatus("ISSUED");
        requestRepository.save(request);

        notificationService.createNotification(request.getUser(), 
            "Your requested items (" + item.getName() + ") have been issued. Pick up at Store.");

        return issuedItemRepository.save(issuance);
    }

    @Transactional
    public void processReturn(Long issuanceId, String outcome, String notes) {
        IssuedItem issuance = issuedItemRepository.findById(issuanceId).orElseThrow();
        Request request = issuance.getRequest();
        Item item = request.getItem();

        issuance.setReturnStatus(outcome);
        request.setStatus(outcome);
        request.setConditionNotes(notes);

        if ("RETURNED".equals(outcome)) { // Good Condition
            item.setQuantity(item.getQuantity() + issuance.getQuantity());
            inventoryService.updateItem(item.getId(), item);
        }

        issuedItemRepository.save(issuance);
        requestRepository.save(request);
        notificationService.createNotification(issuance.getIssuedTo(), "Your return has been processed: " + outcome);
    }

    public void notifyPickup(Long requestId) {
        Request request = requestRepository.findById(requestId).orElseThrow();
        notificationService.notifyPickup(request.getUser(), request.getItem().getName());
    }
}