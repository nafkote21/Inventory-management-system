package com.astu.ims.service;

import com.astu.ims.model.Item;
import com.astu.ims.model.Request;
import com.astu.ims.repository.ItemRepository;
import com.astu.ims.repository.RequestRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {
    private final ItemRepository itemRepository;
    private final RequestRepository requestRepository;

    public ReportService(ItemRepository itemRepository, RequestRepository requestRepository) {
        this.itemRepository = itemRepository;
        this.requestRepository = requestRepository;
    }

    public Map<String, Object> getStockReport() {
        List<Item> items = itemRepository.findAll();
        long totalItems = items.size();
        long lowStockCount = items.stream().filter(i -> i.getQuantity() <= 5).count();
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalItems", totalItems);
        report.put("lowStockCount", lowStockCount);
        report.put("items", items);
        return report;
    }

    public Map<String, Object> getRequestHistory() {
        List<Request> requests = requestRepository.findAll();
        Map<String, Object> report = new HashMap<>();
        report.put("totalRequests", requests.size());
        report.put("requests", requests);
        return report;
    }
}