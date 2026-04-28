package com.astu.ims.service;

import com.astu.ims.model.Item;
import com.astu.ims.model.Notification;
import com.astu.ims.model.User;
import com.astu.ims.repository.ItemRepository;
import com.astu.ims.repository.NotificationRepository;
import com.astu.ims.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {
    private final ItemRepository itemRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public InventoryService(ItemRepository itemRepository, 
                            NotificationRepository notificationRepository, 
                            UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Item getItemById(Long id) {
        return itemRepository.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    @Transactional
    public Item addItem(Item item) {
        if (item.getCreatedAt() == null) {
            item.setCreatedAt(LocalDateTime.now());
        }
        return itemRepository.save(item);
    }

    @Transactional
    public Item updateItem(Long id, Item updated) {
        Item item = getItemById(id);
        item.setName(updated.getName());
        item.setCategory(updated.getCategory());
        item.setQuantity(updated.getQuantity());
        item.setReorderLevel(updated.getReorderLevel());
        item.setDescription(updated.getDescription());
        
        Item saved = itemRepository.save(item);
        checkLowStockAndNotify(saved);
        return saved;
    }

    @Transactional
    public void deleteItem(Long id) {
        itemRepository.deleteById(id);
    }

    public void checkLowStockAndNotify(Item item) {
        if (item.getQuantity() <= item.getReorderLevel()) {
            List<User> users = userRepository.findAll();
            for (User u : users) {
                if ("admin".equals(u.getRole()) || "inventory_officer".equals(u.getRole()) || "storekeeper".equals(u.getRole())) {
                    Notification n = new Notification();
                    n.setUser(u);
                    n.setMessage("LOW STOCK ALERT: " + item.getName() + " is at " + item.getQuantity() + " units (Threshold: " + item.getReorderLevel() + ")");
                    n.setRead(false);
                    n.setCreatedAt(LocalDateTime.now());
                    notificationRepository.save(n);
                }
            }
        }
    }
}