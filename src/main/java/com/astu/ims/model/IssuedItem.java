package com.astu.ims.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "issued_items")
@Getter
@Setter
public class IssuedItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "request_id")
    private Request request;

    @ManyToOne
    @JoinColumn(name = "issued_to")
    private User issuedTo;

    @ManyToOne
    @JoinColumn(name = "issued_by")
    private User issuedBy;

    private int quantity;
    private String returnStatus;
    private LocalDateTime issuedAt;
}
