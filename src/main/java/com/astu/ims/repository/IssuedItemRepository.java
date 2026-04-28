package com.astu.ims.repository;

import com.astu.ims.model.IssuedItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssuedItemRepository extends JpaRepository<IssuedItem, Long> {
}
