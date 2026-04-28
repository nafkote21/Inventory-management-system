package com.astu.ims.controller;

import com.astu.ims.model.Item;
import com.astu.ims.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<Item> getAll() {
        return inventoryService.getAllItems();
    }

    @PostMapping
    public Item add(@RequestBody Item item) {
        return inventoryService.addItem(item);
    }

    @PutMapping("/{id}")
    public Item update(@PathVariable Long id, @RequestBody Item item) {
        return inventoryService.updateItem(id, item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inventoryService.deleteItem(id);
    }
}
