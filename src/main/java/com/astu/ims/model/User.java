package com.astu.ims.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String role; // instructor, dept_head, inventory_officer, storekeeper, admin

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}