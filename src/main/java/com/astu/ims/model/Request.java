package com.astu.ims.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
@Getter
@Setter
public class Request {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    private int quantity;
    
    // Statuses: PENDING_DH_APPROVAL, APPROVED_BY_DH, REJECTED, APPROVED_FOR_ISSUANCE, 
    // REJECTED_STOCK, ISSUED, RETURN_PENDING, RETURNED, DAMAGED, LOST
    private String status; 

    private String reason;
    private String conditionNotes;
    private String outcome;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private LocalDateTime createdAt;
}
