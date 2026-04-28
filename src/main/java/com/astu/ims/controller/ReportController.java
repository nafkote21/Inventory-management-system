package com.astu.ims.controller;

import com.astu.ims.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/stock")
    public Map<String, Object> getStockReport() {
        return reportService.getStockReport();
    }

    @GetMapping("/requests")
    public Map<String, Object> getRequestHistory() {
        return reportService.getRequestHistory();
    }
}