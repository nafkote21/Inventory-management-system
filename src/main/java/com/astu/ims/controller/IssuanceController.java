package com.astu.ims.controller;

import com.astu.ims.model.IssuedItem;
import com.astu.ims.service.IssuanceService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/issuances")
public class IssuanceController {
    private final IssuanceService issuanceService;

    public IssuanceController(IssuanceService issuanceService) {
        this.issuanceService = issuanceService;
    }

    @PostMapping("/{requestId}")
    public IssuedItem issue(@PathVariable Long requestId, Authentication auth) {
        return issuanceService.issueItem(requestId, auth.getName());
    }

    @PutMapping("/{issuanceId}/return")
    public void processReturn(@PathVariable Long issuanceId, @RequestBody java.util.Map<String, String> payload) {
        String outcome = payload.get("outcome");
        String notes = payload.getOrDefault("notes", "");
        issuanceService.processReturn(issuanceId, outcome, notes);
    }

    @PostMapping("/{requestId}/notify-pickup")
    public void notifyPickup(@PathVariable Long requestId) {
        issuanceService.notifyPickup(requestId);
    }
}
