package com.astu.ims.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_logs")
@Getter
@Setter
public class StockLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    private String changeType; // add, issue, return
    private int quantity;
    private String description;
    private LocalDateTime createdAt;
}
